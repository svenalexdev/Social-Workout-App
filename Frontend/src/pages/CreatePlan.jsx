import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Switch } from '@headlessui/react';
const baseURL = `${import.meta.env.VITE_API_URL}/plans`;

// mock data to be replaced with API fetch
function CreatePlan() {
  let mockExercises = [
    {
      bodyPart: 'waist',
      equipment: 'body weight',
      gifUrl: 'https://v2.exercisedb.io/image/yy7vvVaXPByinG',
      id: '0001',
      name: '3/4 sit-up',
      target: 'abs',
      secondaryMuscles: ['hip flexors', 'lower back'],
      instructions: [
        'Lie flat on your back with your knees bent and feet flat on the ground.',
        'Place your hands behind your head with your elbows pointing outwards.',
        'Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.',
        'Pause for a moment at the top, then slowly lower your upper body back down to the starting position.',
        'Repeat for the desired number of repetitions.'
      ],
      description:
        'The 3/4 sit-up is an abdominal exercise performed with body weight. It involves curling the torso up to a 45-degree angle, engaging the abs, hip flexors, and lower back. This movement is commonly used to build core strength and stability.',
      difficulty: 'beginner',
      category: 'strength'
    },
    {
      bodyPart: 'chest',
      equipment: 'leverage machine',
      gifUrl: 'https://v2.exercisedb.io/image/De5q-sI-iu8vAI',
      id: '0009',
      name: 'assisted chest dip (kneeling)',
      target: 'pectorals',
      secondaryMuscles: ['triceps', 'shoulders'],
      instructions: [
        'Adjust the machine to your desired height and secure your knees on the pad.',
        'Grasp the handles with your palms facing down and your arms fully extended.',
        'Lower your body by bending your elbows until your upper arms are parallel to the floor.',
        'Pause for a moment, then push yourself back up to the starting position.',
        'Repeat for the desired number of repetitions.'
      ],
      description:
        'The assisted chest dip (kneeling) is a chest-focused exercise performed on a leverage machine, where the user kneels on a pad for support. This machine-assisted variation helps reduce the load, making it accessible for those building strength or learning proper dip technique.',
      difficulty: 'beginner',
      category: 'strength'
    }
  ];

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

  // Effect management
  // Storing a selected exercise to localStorage
  // useEffect(() => {
  //   if (selectedExercise) {
  //     localStorage.setItem('exercises', JSON.stringify(selectedExercise));
  //     console.log(selectedExercise);
  //   }
  // }, [selectedExercise]);

  // Load exercises from localStorage when createPlan = true
  useEffect(() => {
    if (createPlan) {
      const stored = JSON.parse(localStorage.getItem('exercises')) || [];
      // Ensure each exercise has a name (check if still needed once fetched from API)
      setEditableExercises(
        stored.map(e => {
          if (!e.name) {
            const found = mockExercises.find(m => m.id === e.id);
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

  // Useeffect to auto-save plan to localStorage
  useEffect(() => {
    const userID = localStorage.getItem('userId');
    const plan = {
      userId: userID,
      name: planName,
      isPublic: isPublic,
      exercise: editableExercises.map(e => ({
        exerciseId: e.id?.toString() ?? '',
        sets: Number(e.sets) || 1,
        reps: Number(e.reps) || 1,
        weight: Number(e.weight) || 1,
        restTime: Number(e.restTime) || 1
      }))
    };
    localStorage.setItem('plan', JSON.stringify(plan));
  }, [planName, editableExercises, isPublic]);

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
      const response = await fetch(baseURL, {
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
  const filteredExercises = mockExercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Modal / popup to show exercise list  */}
      {showExercises && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto overflow-hidden relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowExercises(false);
                setSelectedExercise([]);
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
                  // Avoid double entries
                  // setEditableExercises(prev => {
                  //   const newExercises = selectedExercise.filter(sel => !prev.some(e => e.id === sel.id));
                  //   return [...prev, ...newExercises];
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
            <ul>
              {filteredExercises.map((mockExercise, idx) => (
                <li
                  key={mockExercise.id}
                  // Select several exercises in the list - if already selected, deselect
                  onClick={() =>
                    setSelectedExercise(prev =>
                      prev.some(item => item.id === mockExercise.id)
                        ? prev.filter(item => item.id !== mockExercise.id)
                        : [
                            ...prev,
                            {
                              id: mockExercise.id,
                              name: mockExercise.name,
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
                    selectedExercise.some(item => item.id === mockExercise.id) ? 'bg-green-800' : 'hover:bg-slate-600'
                  }
                                    ${idx !== mockExercises.length - 1 ? 'border-b border-gray-600' : ''}
                    `}
                >
                  {capitalizeWords(mockExercise.name)} <br />
                  <span className="text-sm">{capitalizeWords(mockExercise.bodyPart)}</span>
                </li>
              ))}
            </ul>
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
            <span className="text-sm font-medium">{isPublic ? 'Public' : 'Private'}</span>
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
            <span className="text-sm font-medium">{isPublic ? 'Public' : 'Private'}</span>
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
