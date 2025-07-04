import { useState, useEffect, use } from 'react';
import { useNavigate } from 'react-router';
import { Switch } from '@headlessui/react';
import checkAuth from '../data/checkAuth';
const baseURL = `${import.meta.env.VITE_API_URL}`;

function CreatePlan() {
  // Site navigation
  const navigate = useNavigate();

  // State management
  const [showExercises, setShowExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState([]);
  const [createPlan, setCreatePlan] = useState(false);
  const [editableExercises, setEditableExercises] = useState([]);
  const [planName, setPlanName] = useState('New Template');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState([]); // exercise fetch

  // Effect management
  // Storing a selected exercise to localStorage
  // useEffect(() => {
  //   if (selectedExercise) {
  //     localStorage.setItem('exercises', JSON.stringify(selectedExercise));
  //     console.log(selectedExercise);
  //   }
  // }, [selectedExercise]);

  // Verify user
  useEffect(() => {
    const verifyUser = async () => {
      const login = await checkAuth();
      if (!login) {
        alert('User not login');
        navigate('/signin');
      }
    };
    verifyUser();
  }, []);

  // Load exercises from localStorage when createPlan = true
  useEffect(() => {
    if (createPlan) {
      const stored = JSON.parse(localStorage.getItem('exercises')) || [];
      // Ensure each exercise has a name (check if still needed once fetched from API)
      setEditableExercises(
        stored.map(e => {
          if (!e.name) {
            const found = exercises.find(ex => ex.exerciseId === e.exerciseId);
            return { ...e, name: found ? found.name : '' };
          }
          return e;
        })
      );
    }
  }, [createPlan]);

  // Open modal as soon as createPlan is true and modal requested (click on add exercises button)
  useEffect(() => {
    if (createPlan && shouldOpenModal) {
      setShowExercises(true);
      setShouldOpenModal(false);
    }
  }, [createPlan, shouldOpenModal]);

  // Auto-save plan to localStorage
  useEffect(() => {
    const userID = localStorage.getItem('userId');
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
    localStorage.setItem('plan', JSON.stringify(plan));
  }, [planName, editableExercises, isPublic]);

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

  // // Fetch all matching exercises when searching
  // useEffect(() => {
  //   if (searchTerm.length < 2) return; // Only search for 2+ chars
  //   let ignore = false;
  //   const fetchSearch = async () => {
  //     try {
  //       const res = await fetch(`${baseURL}/exercises?search=${encodeURIComponent(searchTerm)}`);
  //       if (!res.ok) throw new Error(`${res.status}. Something went wrong!`);
  //       const data = await res.json();
  //       if (!ignore) {
  //         setExercises(data);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch search results:', error);
  //       setExercises([]);
  //     }
  //   };
  //   fetchSearch();
  //   return () => {ignore = true; };
  // }, [searchTerm]);

  // Handler
  // Handlers to save title name on blur or Enter
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

  // Save button handler to get localStorage, POST information and delete it afterwards
  const handleSaveButton = async () => {
    if (editableExercises.length === 0) {
      alert('Please add at least one exercise to your plan!');
      return;
    }
    const plan = JSON.parse(localStorage.getItem('plan'));
    console.log('Plan to save:', plan);
    if (!plan) {
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
        localStorage.removeItem('plan');
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

  // Helper functions
  // Capitalizing first letter of every word w/ regular expression (after spaces, parantheses, dashes etc.)
  const capitalizeWords = str => {
    // return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    if (!str) return '';
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  // Other
  // Variable to filter exercises based on search term (search bar), all lower-cased for case-insensitivity
  const filteredExercises = exercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
  console.log(filteredExercises);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Modal / popup to show exercise list  */}
      {showExercises && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full h-[600px] min-h-full overflow-hidden relative flex flex-col">
            <div className="sticky top-0 z-10 pb-2">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowExercises(false);
                  setSelectedExercise([]);
                  setSearchTerm('');
                }}
                className="absolute top-3 left-4 text-2xl hover:text-white font-bold"
              >
                ×
              </button>
              <div className="flex justify-end mt-2 mr-2">
                <button
                  onClick={() => {
                    setShowExercises(false);
                    setEditableExercises(prev => [...prev, ...selectedExercise]);
                    setSelectedExercise([]);
                  }}
                  className="btn text-lg bg-gray-500 border-none text-white mr-1"
                >
                  Add ({selectedExercise.length})
                </button>
              </div>
              {/* Search bar */}
              <div className="flex justify-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full max-w-xs p-2 mb-4 rounded bg-gray-700 placeholder-gray-400 mt-4"
                />
              </div>
            </div>
            <div className="overflow-y-auto">
              <ul>
                {filteredExercises.map((ex, idx) => (
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
                                sets: [],
                                reps: [],
                                weight: [],
                                restTime: []
                              }
                            ]
                      )
                    }
                    // Mark a selected exercise with color
                    className={`text-xl font-bold mt-2 p-2 rounded ${
                      selectedExercise.some(item => item.exerciseId === ex.exerciseId)
                        ? 'bg-green-800'
                        : 'hover:bg-slate-600'
                    }
                                    ${idx !== filteredExercises.length - 1 ? 'border-b border-gray-600' : ''}
                    `}
                  >
                    {capitalizeWords(ex.name)} <br />
                    <span className="text-sm">{capitalizeWords(ex.bodyPart)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Conditional rendering branch 1 */}
      {!createPlan ? (
        <div>
          <div className="flex justify-around items-center">
            <button onClick={handleGoBack} className="btn text-lg bg-gray-500 border-none text-white">
              X
            </button>
            <h1 className="text-center font-bold text-lg">{planName}</h1>
            <button onClick={handleSaveButton} className="btn text-lg bg-gray-500 border-none text-white">
              Save
            </button>
          </div>
          {/* Editable title */}
          <div className="flex mt-12 ml-6 items-center">
            {isEditingName ? (
              <input
                type="text"
                value={planName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                autoFocus
                className="text-2xl font-bold p-3 bg-gray-700 rounded"
              />
            ) : (
              <h2
                className="text-2xl font-bold p-2"
                onClick={() => {
                  setIsEditingName(true);
                }}
              >
                {planName}
              </h2>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-8 mb-2">
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
            <button onClick={handleAddExercise} className="btn text-lg bg-gray-500 border-none text-white w-xs">
              Add exercises
            </button>
          </div>
          <div className="flex justify-center mt-40">
            <button className="btn text-lg bg-gray-500 border-none text-white h-35 w-35">
              Create Plan <br /> with AI
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Conditional rendering branch 2 */}
          <div className="flex justify-around items-center">
            <button onClick={handleGoBack} className="btn text-lg bg-gray-500 border-none text-white">
              X
            </button>
            <h1 className="text-center font-bold text-lg">{planName}</h1>
            <button onClick={handleSaveButton} className="btn text-lg bg-gray-500 border-none text-white">
              Save
            </button>
          </div>
          {/* Editable title */}
          <div className="flex mt-12 ml-6 items-center">
            {isEditingName ? (
              <input
                type="text"
                value={planName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                autoFocus
                className="text-2xl font-bold p-3 bg-gray-700 rounded"
              />
            ) : (
              <h2 className="text-2xl font-bold p-2 cursor-pointer" onClick={() => setIsEditingName(true)}>
                {planName}
              </h2>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-8 mb-2">
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
            <button
              onClick={() => setShowExercises(true)}
              className="btn text-lg bg-gray-500 border-none text-white w-xs"
            >
              Add exercises
            </button>
          </div>
          <div className="mt-8">
            {editableExercises.map((exercise, idx) => (
              <div key={idx} className="ml-2 mr-2 mt-5 mb-6 p-3 rounded-lg bg-gray-800">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg">{capitalizeWords(exercise.name)}</div>
                  <button
                    onClick={() => {
                      handleRemoveExercise(idx);
                    }}
                  >
                    ⛔️
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold mt-2 mb-1">
                  <span>Sets</span>
                  <span>Reps</span>
                  <span>Weight</span>
                  <span>Rest</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={exercise.sets?.toString() ?? ''}
                    onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                    className="bg-gray-700 rounded px-2 py-1 text-center"
                    min={0}
                  />
                  <input
                    type="number"
                    placeholder="0"
                    value={exercise.reps?.toString() ?? ''}
                    onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                    className="bg-gray-700 rounded px-2 py-1 text-center"
                    min={0}
                  />
                  <input
                    type="number"
                    placeholder="0"
                    value={exercise.weight?.toString() ?? ''}
                    onChange={e => handleExerciseChange(idx, 'weight', e.target.value)}
                    className="bg-gray-700 rounded px-2 py-1 text-center"
                    min={0}
                  />
                  <input
                    type="number"
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
        </div>
      )}
    </div>
  );
}

export default CreatePlan;
