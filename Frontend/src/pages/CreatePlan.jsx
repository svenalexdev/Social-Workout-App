import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Switch } from '@headlessui/react';
import { setCookie, getCookie, deleteCookie } from '../utils/cookieUtils.js';

import ChatApp from '../components/AiChat/Form.jsx';
import BodypartFilter from '../components/BodypartFilter.jsx';
import capitalizeWords from '../utils/helpers.js';
const baseURL = `${import.meta.env.VITE_API_URL}`;

function CreatePlan() {
  // ai chat button
  const [chatOpen, setChatOpen] = useState(false);
  const toggleChatOpen = () => {
    if (!chatOpen) {
      // When opening AI chat, ensure there's a base plan in localStorage
      const userID = getCookie('userId');
      const basePlan = {
        userId: userID || '',
        name: 'AI Generated Plan',
        isPublic: false,
        exercise: []
      };
      localStorage.setItem('plan', JSON.stringify(basePlan));
      console.log('Created base plan for AI generation');
    }
    setChatOpen(prev => !prev);
  };

  // Site navigation
  const navigate = useNavigate();

  // Clear stored plan data on component mount (fresh start every visit)
  useEffect(() => {
    // Clear both localStorage and cookies
    localStorage.removeItem('plan');
    deleteCookie('plan');
    deleteCookie('exercises'); // Also clear legacy exercises cookie
    console.log('Cleared stored plan data on page visit');
  }, []); // Run only once on mount

  // State management
  const [showExercises, setShowExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState([]);
  const [createPlan, setCreatePlan] = useState(false);
  const [editableExercises, setEditableExercises] = useState([]);
  const [planName, setPlanName] = useState('New Plan');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState([]); // exercise fetch
  const [selectedBodyparts, setSelectedBodyparts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(100);

  // Ref
  const listRef = useRef(null);

  // State to track if we've loaded plan from cookies
  const [planLoadedFromCookies, setPlanLoadedFromCookies] = useState(false);
  // Effect management - legacy exercises cookie support (deprecated)
  useEffect(() => {
    if (createPlan && !planLoadedFromCookies) {
      // Only load from 'exercises' cookie if we don't already have exercises from the plan
      if (editableExercises.length === 0) {
        const stored = JSON.parse(getCookie('exercises') || '[]');
        // Ensure each exercise has full data from API
        setEditableExercises(
          stored.map(e => {
            const found = exercises.find(ex => ex.exerciseId === e.exerciseId);
            if (found) {
              return {
                ...e,
                name: found.name,
                gifUrl: found.gifUrl,
                target: found.target,
                equipment: found.equipment,
                bodyPart: found.bodyPart
              };
            }
            return {
              ...e,
              name: e.name || `Exercise ${e.exerciseId}`,
              gifUrl: e.gifUrl || '',
              target: e.target || '',
              equipment: e.equipment || '',
              bodyPart: e.bodyPart || ''
            };
          })
        );
      }
    }
  }, [createPlan, planLoadedFromCookies]);

  // Open modal as soon as createPlan is true and modal requested (click on add exercises button)
  useEffect(() => {
    if (createPlan && shouldOpenModal) {
      setShowExercises(true);
      setShouldOpenModal(false);
    }
  }, [createPlan, shouldOpenModal]);

  // Scroll back to top and reset to 100 when a bodypart filter changes/is deselected or searchterm changes/is reset
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
    setVisibleCount(100);
  }, [searchTerm, selectedBodyparts]);

  // Auto-save plan to cookies (only after we've loaded from cookies to avoid overriding)
  useEffect(() => {
    if (!planLoadedFromCookies) return; // Don't auto-save until we've loaded from cookies

    const userID = getCookie('userId');
    const plan = {
      userId: userID,
      name: planName,
      isPublic: isPublic,
      exercise: editableExercises.map(e => ({
        exerciseId: e.exerciseId?.toString() ?? '',
        sets: Number(e.sets) || 1,
        reps: Number(e.reps) || 1,
        weight: Number(e.weight) || 1,
        restTime: Number(e.restTime) || 1
      }))
    };
    setCookie('plan', JSON.stringify(plan));
    localStorage.setItem('plan', JSON.stringify(plan));
  }, [planName, editableExercises, isPublic, planLoadedFromCookies]);

  // Fetch exercises
  useEffect(() => {
    let ignore = false;
    const fetchExercises = async () => {
      try {
        const res = await fetch(`${baseURL}/exercises/`);
        if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);
        const data = await res.json();
        if (!ignore) {
          setExercises(data);
        }
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        setExercises([]);
      }
    };

    fetchExercises();

    return () => {
      ignore = true;
    };
  }, []);

  // Load plan data from cookies - triggered when AI generates a plan
  const loadPlanFromCookies = () => {
    const planData = getCookie('plan');
    console.log('Checking for plan data in cookies:', planData);

    if (planData) {
      try {
        const parsedPlan = JSON.parse(planData);
        console.log('Loaded plan from cookies:', parsedPlan);

        // Set plan name if available
        if (parsedPlan.name && parsedPlan.name !== 'New Template') {
          setPlanName(parsedPlan.name);
          console.log('Set plan name:', parsedPlan.name);
        }

        // Set public status if available
        if (typeof parsedPlan.isPublic === 'boolean') {
          setIsPublic(parsedPlan.isPublic);
          console.log('Set public status:', parsedPlan.isPublic);
        }

        // Set exercises if available
        if (parsedPlan.exercise && Array.isArray(parsedPlan.exercise) && parsedPlan.exercise.length > 0) {
          console.log('Found exercises in plan:', parsedPlan.exercise);
          console.log(
            'Available exercises in database:',
            exercises.length > 0 ? exercises.slice(0, 3) : 'No exercises loaded yet'
          );

          // Add missing exercise properties (name, gifUrl, etc.) and filter out invalid exercises
          const validExercises = [];

          parsedPlan.exercise.forEach(e => {
            console.log(`Looking for exercise with ID: ${e.exerciseId}`);
            if (exercises.length > 0) {
              const found = exercises.find(ex => ex.exerciseId === e.exerciseId);
              if (found) {
                console.log(`Found exercise in database:`, found.name);
                validExercises.push({
                  ...e,
                  name: found.name,
                  gifUrl: found.gifUrl,
                  target: found.target,
                  equipment: found.equipment,
                  bodyPart: found.bodyPart
                });
              } else {
                console.log(`Exercise ID ${e.exerciseId} not found in database - removing from plan`);
                // Exercise not found, don't add it to validExercises (effectively deleting it)
              }
            } else {
              // If exercises haven't loaded yet, keep the exercise but add fallback data
              validExercises.push({
                ...e,
                name: e.name || `Exercise ${e.exerciseId}`,
                gifUrl: e.gifUrl || '',
                target: e.target || '',
                equipment: e.equipment || '',
                bodyPart: e.bodyPart || ''
              });
            }
          });

          console.log('Valid exercises after filtering:', validExercises);

          if (validExercises.length > 0) {
            setEditableExercises(validExercises);
            setCreatePlan(true); // Show the create plan view since we have exercises
            console.log('Set createPlan to true');

            // Update localStorage and cookies with only valid exercises
            const userID = getCookie('userId');
            const updatedPlan = {
              ...parsedPlan,
              userId: userID || parsedPlan.userId,
              exercise: validExercises.map(e => ({
                exerciseId: e.exerciseId?.toString() ?? '',
                sets: Number(e.sets) || 1,
                reps: Number(e.reps) || 1,
                weight: Number(e.weight) || 1,
                restTime: Number(e.restTime) || 1
              }))
            };

            localStorage.setItem('plan', JSON.stringify(updatedPlan));
            setCookie('plan', JSON.stringify(updatedPlan));
            console.log('Updated localStorage and cookies with valid exercises only');

            // Close AI chat if it was open
            setChatOpen(false);
            console.log('Closed AI chat');
          } else {
            console.log('No valid exercises found, not setting createPlan to true');
          }

          setPlanLoadedFromCookies(true);
          return true;
        }
      } catch (error) {
        console.error('Failed to parse plan data from cookies:', error);
      }
    }
    return false;
  };

  // Check for plan when exercises are loaded (for name resolution)
  useEffect(() => {
    if (exercises.length > 0 && !planLoadedFromCookies) {
      loadPlanFromCookies();
    }
  }, [exercises, planLoadedFromCookies]);

  // Update exercise data when exercises are fetched
  useEffect(() => {
    if (exercises.length > 0 && editableExercises.length > 0) {
      const updatedExercises = editableExercises.map(e => {
        const found = exercises.find(ex => ex.exerciseId === e.exerciseId);
        if (found) {
          // Always update with full exercise data from database
          return {
            ...e,
            name: found.name,
            gifUrl: found.gifUrl,
            target: found.target,
            equipment: found.equipment,
            bodyPart: found.bodyPart
          };
        }
        return e;
      });
      setEditableExercises(updatedExercises);
      console.log('Updated exercises with full data:', updatedExercises);
    }
  }, [exercises]); // Update exercise data when exercises are fetched

  // Check for plan when exercises are loaded (for name resolution)
  useEffect(() => {
    if (exercises.length > 0 && !planLoadedFromCookies) {
      loadPlanFromCookies();
    }
  }, [exercises, planLoadedFromCookies]);

  // Update exercise data when exercises are fetched
  useEffect(() => {
    if (exercises.length > 0 && editableExercises.length > 0) {
      const updatedExercises = editableExercises.map(e => {
        const found = exercises.find(ex => ex.exerciseId === e.exerciseId);
        if (found) {
          // Always update with full exercise data from database
          return {
            ...e,
            name: found.name,
            gifUrl: found.gifUrl,
            target: found.target,
            equipment: found.equipment,
            bodyPart: found.bodyPart
          };
        }
        return e;
      });
      setEditableExercises(updatedExercises);
      console.log('Updated exercises with full data:', updatedExercises);
    }
  }, [exercises]); // Update exercise data when exercises are fetched

  // Handler
  // Handler for title renaming
  const handleNameBlur = () => setIsEditingName(false);
  const handleNameChange = e => setPlanName(e.target.value);
  const handleNameKeyDown = e => {
    if (e.key === 'Enter') {
      setIsEditingName(false);
    }
  };

  // Handler to go back to plan page
  const handleGoBack = () => {
    navigate('/plans');
  };

  // Handler to open createPlan view / modal
  const handleAddExercise = () => {
    setCreatePlan(true);
    setShouldOpenModal(true);
  };

  // Handle selecting bodyparts
  const handleSelect = part => {
    if (!selectedBodyparts.includes(part)) {
      setSelectedBodyparts([...selectedBodyparts, part]);
    }
  };

  // Handle removing bodyparts
  const handleRemove = part => {
    setSelectedBodyparts(selectedBodyparts.filter(p => p !== part));
  };

  // Handler to remove exercise of Create Plan view
  const handleRemoveExercise = idx => {
    setEditableExercises(prev => prev.filter((_, i) => i !== idx));
  };

  // Handler to update exercise data or state when an input changes
  const handleExerciseChange = (idx, field, value) => {
    setEditableExercises(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: Number(value) };
      return updated;
    });
  };

  // Handler to extend exercise list in batch sizes of 100 when scrolling down
  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setVisibleCount(prev => Math.min(prev + 100, filteredExercises.length));
    }
  };

  // Save button handler to get cookies, POST information and delete it afterwards
  const handleSaveButton = async () => {
    if (editableExercises.length === 0) {
      alert('Please add at least one exercise to your plan!');
      return;
    }
    const plan = JSON.parse(getCookie('plan') || '{}');
    console.log('Plan to save:', plan);
    if (!plan || !plan.userId) {
      alert('No plan found!');
      return;
    }
    try {
      const response = await fetch(`${baseURL}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      if (response.ok) {
        alert('Plan saved successfully!');
        deleteCookie('plan');
        setTimeout(() => {
          navigate('/plans');
        }, 1000);
      } else {
        alert('Error while saving!');
      }
    } catch (error) {
      alert('Network error!');
      console.error(error);
    }
  };

  // Other
  // Variable to filter exercises based on search term (search bar), and bodyparts based on filter - all lower-cased for case-insensitivity
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBodypart = selectedBodyparts.length === 0 || selectedBodyparts.includes(ex.bodyPart?.toLowerCase());
    return matchesSearch && matchesBodypart;
  });
  // console.log(filteredExercises);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      {/* Modal / popup to show exercise list  */}
      {showExercises && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full h-[600px] min-h-full overflow-hidden relative flex flex-col">
            <div className="sticky top-0 z-10 pb-2 px-3">
              <div className="flex justify-between items-center py-3">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowExercises(false);
                    setSelectedExercise([]);
                    setSearchTerm('');
                    setVisibleCount(100);
                    setSelectedBodyparts([]);
                  }}
                  className="btn text-lg bg-gray-500 border-none text-white"
                >
                  ×
                </button>
                <button
                  onClick={() => {
                    setShowExercises(false);
                    setEditableExercises(prev => [...prev, ...selectedExercise]);
                    setSelectedExercise([]);
                    setVisibleCount(100);
                    setSelectedBodyparts([]);
                  }}
                  className="btn text-lg bg-gray-500 border-none text-white"
                >
                  Add ({selectedExercise.length})
                </button>
              </div>
              {/* Search bar */}
              <div className="flex justify-center">
                <input
                  type="text"
                  name="searchTerm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full max-w-xs p-2 mb-4 rounded bg-gray-700 placeholder-gray-400 mt-4"
                />
              </div>
              {/* Bodypart Filter UI */}
              <BodypartFilter selectedBodyparts={selectedBodyparts} onSelect={handleSelect} onRemove={handleRemove} />
            </div>
            <div className="overflow-y-auto px-3" ref={listRef} onScroll={handleScroll}>
              <ul>
                {filteredExercises.slice(0, visibleCount).map((ex, idx) => (
                  <li
                    key={ex.exerciseId}
                    // Select several exercises in the list - if already selected, deselect
                    onClick={() =>
                      setSelectedExercise(prev =>
                        prev.some(item => item.exerciseId === ex.exerciseId)
                          ? prev.filter(item => item.exerciseId !== ex.exerciseId)
                          : [
                              ...prev,
                              {
                                exerciseId: ex.exerciseId,
                                name: ex.name,
                                gifUrl: ex.gifUrl,
                                sets: [],
                                reps: [],
                                weight: [],
                                restTime: []
                              }
                            ]
                      )
                    }
                    // Mark a selected exercise with color
                    className={`flex items-center text-lg font-bold py-2 rounded-none ${
                      selectedExercise.some(item => item.exerciseId === ex.exerciseId)
                        ? 'bg-green-800'
                        : 'hover:bg-slate-600'
                    }
                                    ${idx !== filteredExercises.length - 1 ? 'border-b border-gray-600' : ''}
                    `}
                  >
                    <img src={ex.gifUrl} className="w-16 h-16 rounded object-cover" />
                    <div className="ml-4">
                      {capitalizeWords(ex.name)} <br />
                      <span className="text-sm">{capitalizeWords(ex.bodyPart)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Only show main content and AI button when model is NOT open */}
      {!showExercises && (
        <>
          {/* Conditional rendering branch 1 */}
          {!createPlan ? (
            <div className="p-3">
              <div className="flex justify-between items-center ">
                <button onClick={handleGoBack} className="btn text-lg bg-gray-500 border-none text-white">
                  X
                </button>
                <h1 className="flex-1 text-center font-bold text-lg mx-2 truncate overflow-hidden whitespace-nowrap">
                  {planName}
                </h1>
                <button onClick={handleSaveButton} className="btn text-lg bg-gray-500 border-none text-white">
                  Save
                </button>
              </div>
              {/* Editable title */}
              <div className="flex mt-6 items-center">
                {isEditingName ? (
                  <input
                    type="text"
                    name="planName"
                    value={planName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={handleNameKeyDown}
                    autoFocus
                    className="text-2xl font-bold p-3 bg-gray-700 rounded"
                  />
                ) : (
                  <div
                    className="flex items-center text-2xl font-bold w-full cursor-pointer group active:bg-gray-700 rounded"
                    onClick={() => setIsEditingName(true)}
                    title="Tap to edit"
                    aria-label="Edit name"
                  >
                    <span className="text-left group-hover:text-[#ffa622] transition-colors">{planName}</span>
                    <span className="ml-2 text-lg text-gray-400 group-hover:text-[#ffa622] transition-colors select-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16.5 3.5a2.121 2.121 0 013 3L7 19.5 3 21l1.5-4L16.5 3.5z"
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-2 mb-2">
                <Switch
                  checked={isPublic}
                  onChange={setIsPublic}
                  className={`${isPublic ? 'bg-blue-600' : 'bg-gray-200'}
            relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span
                    className={`${isPublic ? 'translate-x-6' : 'translate-x-1'}
              inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <span className="text-sm font-medium">{isPublic ? 'Share Plan with Others' : 'Keep Plan Private'}</span>
              </div>
              <div className="flex justify-center mt-8">
                <button onClick={handleAddExercise} className="btn text-lg bg-gray-500 border-none text-white w-full">
                  Add exercises
                </button>
              </div>
              <div className="fixed bottom-24 right-5 z-[9999]">
                <div className="flex flex-col items-end justify-end gap-4">
                  <div className={`${chatOpen ? 'block' : 'hidden'} shadow-lg rounded-lg`}>
                    <ChatApp />
                  </div>
                  <button
                    onClick={() => {
                      toggleChatOpen();
                      setCreatePlan(true);
                    }}
                    className=" btn h-25 w-25 border-none btn-primary btn-xl btn-circle bg-[#ffa622]"
                  >
                    Create with AI
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3">
              {/* Conditional rendering branch 2 */}
              <div className="flex justify-between items-center">
                <button onClick={handleGoBack} className="btn text-lg bg-gray-500 border-none text-white">
                  X
                </button>
                <h1 className="flex-1 text-center font-bold text-lg mx-2 truncate overflow-hidden whitespace-nowrap">
                  {planName}
                </h1>
                <button onClick={handleSaveButton} className="btn text-lg bg-gray-500 border-none text-white">
                  Save
                </button>
              </div>
              {/* Editable title */}
              <div className="flex mt-6 items-center">
                {isEditingName ? (
                  <input
                    type="text"
                    name="planName"
                    value={planName}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    onKeyDown={handleNameKeyDown}
                    autoFocus
                    className="text-2xl font-bold p-3 bg-gray-700 rounded"
                  />
                ) : (
                  <div
                    className="flex items-center text-2xl font-bold w-full cursor-pointer group active:bg-gray-700 rounded"
                    onClick={() => setIsEditingName(true)}
                    title="Tap to edit"
                    aria-label="Edit name"
                  >
                    <span className="text-left group-hover:text-[#ffa622] transition-colors">{planName}</span>
                    <span className="ml-2 text-lg text-gray-400 group-hover:text-[#ffa622] transition-colors select-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16.5 3.5a2.121 2.121 0 013 3L7 19.5 3 21l1.5-4L16.5 3.5z"
                        />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-2 mb-2">
                <Switch
                  checked={isPublic}
                  onChange={setIsPublic}
                  className={`${isPublic ? 'bg-blue-600' : 'bg-gray-200'}
            relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span
                    className={`${isPublic ? 'translate-x-6' : 'translate-x-1'}
              inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <span className="text-sm font-medium">{isPublic ? 'Share Plan with Others' : 'Keep Plan Private'}</span>
              </div>
              <div className="mt-8 px-4">
                <button
                  onClick={() => setShowExercises(true)}
                  className="btn text-lg bg-gray-500 border-none text-white w-full"
                >
                  Add exercises
                </button>
              </div>

              {/* AI Button - show below Add exercises when no exercises, or below exercises when they exist */}
              {editableExercises.length === 0 && (
                <div className="mt-4 px-4">
                  <button onClick={toggleChatOpen} className="btn text-lg bg-[#ffa622] border-none text-white w-full">
                    Create with AI
                  </button>
                </div>
              )}

              {/* AI Chat Form - integrated into the main flow */}
              {chatOpen && (
                <div className="mt-6 mx-4">
                  <ChatApp
                    onSuccess={() => {
                      setTimeout(() => {
                        loadPlanFromCookies();
                      }, 100); // Small delay to ensure cookie is set
                    }}
                  />
                </div>
              )}
              <div className="mt-8">
                {editableExercises.map((exercise, idx) => (
                  <div key={idx} className="mt-5 mb-6 p-3 rounded-lg bg-gray-800">
                    <div className="flex items-center">
                      {exercise.gifUrl ? (
                        <img src={exercise.gifUrl} className="w-11 h-11 rounded object-cover" alt={exercise.name} />
                      ) : (
                        <div className="w-11 h-11 rounded bg-gray-600 flex items-center justify-center text-xs text-gray-300">
                          💪
                        </div>
                      )}
                      <div className="font-bold text-lg ml-4 mr-4">{capitalizeWords(exercise.name)}</div>
                      <button
                        onClick={() => {
                          handleRemoveExercise(idx);
                        }}
                        className="ml-auto text-gray-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs font-semibold mt-4 mb-1">
                      <span>Sets</span>
                      <span>Reps</span>
                      <span>Weight</span>
                      <span>Rest</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="number"
                        name={`sets-${idx}`}
                        placeholder="0"
                        value={exercise.sets?.toString() ?? ''}
                        onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                        className="bg-gray-700 rounded px-2 py-1 text-center"
                        min={0}
                      />
                      <input
                        type="number"
                        name={`reps-${idx}`}
                        placeholder="0"
                        value={exercise.reps?.toString() ?? ''}
                        onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                        className="bg-gray-700 rounded px-2 py-1 text-center"
                        min={0}
                      />
                      <input
                        type="number"
                        name={`weight-${idx}`}
                        placeholder="0"
                        value={exercise.weight?.toString() ?? ''}
                        onChange={e => handleExerciseChange(idx, 'weight', e.target.value)}
                        className="bg-gray-700 rounded px-2 py-1 text-center"
                        min={0}
                      />
                      <input
                        type="number"
                        name={`restTime-${idx}`}
                        placeholder="0"
                        value={exercise.restTime?.toString() ?? ''}
                        onChange={e => handleExerciseChange(idx, 'restTime', e.target.value)}
                        className="bg-gray-700 rounded px-2 py-1 text-center"
                        min={0}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Button - show below exercises when they exist */}
              {editableExercises.length > 0 && (
                <div className="mt-6 px-4 mb-4">
                  <button onClick={toggleChatOpen} className="btn text-lg bg-[#ffa622] border-none text-white w-full">
                    New Plan with AI
                  </button>
                </div>
              )}

              {/* AI Chat Form - show below everything when exercises exist */}
              {chatOpen && editableExercises.length > 0 && (
                <div className="mt-6 mx-4">
                  <ChatApp
                    onSuccess={() => {
                      setTimeout(() => {
                        loadPlanFromCookies();
                      }, 100); // Small delay to ensure cookie is set
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CreatePlan;
