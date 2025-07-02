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

  // Handler to save title name on blur or Enter
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

  // Storing a selected exercise to localStorage
  useEffect(() => {
    if (selectedExercise) {
      localStorage.setItem('exercises', JSON.stringify(selectedExercise));
      console.log(selectedExercise);
    }
  }, [selectedExercise]);

  // Load exercises from localStorage when createPlan = true
  useEffect(() => {
    if (createPlan) {
      const stored = JSON.parse(localStorage.getItem('exercises')) || [];
      setEditableExercises(stored);
    }
  }, [createPlan]);

  // Capitalizing first letter of every word w/ regular expression (after spaces, parantheses, dashes etc.)
  const capitalizeWords = str => {
    // return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  //Handler to update exercise data or state when an input changes
  const handleExerciseChange = (idx, field, value) => {
    setEditableExercises(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: Number(value) };
      return updated;
    });
  };

  // Save button handler to get localStorage, POST information and delete it afterwards
  const handleSaveButton = async () => {
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

  // Useeffect to auto-save plan
  useEffect(() => {
    const plan = {
      userId: '686451a488a5ca606f85c212',
      name: planName,
      isPublic: isPublic, // adding toggle still needed
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

  return !createPlan ? (
    <div>
      <div className="flex justify-around items-center">
        <button onClick={handleGoBack} className="btn btn-primary text-lg">
          X
        </button>
        <h1 className="text-center font-bold text-lg">{planName}</h1>
        <button onClick={handleSaveButton} className="btn btn-primary text-lg">
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
            className="text-2xl font-bold p-3"
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
        <button onClick={() => setShowExercises(!showExercises)} className="btn btn-primary w-xs text-lg">
          Add exercises
        </button>
      </div>
      {showExercises && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowExercises(false)}
              className="absolute top-3 left-4 text-2xl text-gray-300 hover:text-white font-bold"
            >
              ×
            </button>
            <div className="flex justify-end mt-2 mr-2">
              <button
                onClick={() => {
                  setCreatePlan(true);
                  setEditableExercises(prev => {
                    const newExercises = selectedExercise.filter(sel => !prev.some(e => e.id === sel.id));
                    return [...prev, ...newExercises];
                  });
                  setShowExercises(false);
                }}
                className="btn btn-primary text-lg"
              >
                Add ({selectedExercise.length})
              </button>
            </div>
            <ul>
              {mockExercises.map((mockExercise, idx) => (
                <li
                  key={mockExercise.id}
                  // Select several exercises in the list - if already selected, deselect
                  onClick={() =>
                    setSelectedExercise(prev =>
                      prev.some(item => item.id === mockExercise.id)
                        ? prev.filter(item => item.id !== mockExercise.id)
                        : [...prev, { id: mockExercise.id, sets: 0, reps: 0, weight: 0, restTime: 0 }]
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
      <div className="flex justify-center mt-40">
        <button className="btn btn-primary h-35 w-35 text-lg">
          Create Plan <br /> with AI
        </button>
      </div>
    </div>
  ) : (
    <div>
      <div className="flex justify-around items-center">
        <button onClick={handleGoBack} className="btn btn-primary text-lg">
          X
        </button>
        <h1 className="text-center font-bold text-lg">{planName}</h1>
        <button onClick={handleSaveButton} className="btn btn-primary text-lg">
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
          <h2 className="text-2xl font-bold p-3 cursor-pointer" onClick={() => setIsEditingName(true)}>
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
        <button onClick={() => setShowExercises(!showExercises)} className="btn btn-primary w-xs text-lg">
          Add exercises
        </button>
      </div>
      {showExercises && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50  p-6">
          <div className="bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowExercises(false)}
              className="absolute top-3 left-4 text-2xl text-gray-300 hover:text-white font-bold"
            >
              ×
            </button>
            <div className="flex justify-end mt-2 mr-2">
              <button
                onClick={() => {
                  setCreatePlan(true);
                  setShowExercises(false);
                  setEditableExercises(prev => {
                    const newExercises = selectedExercise.filter(sel => !prev.some(e => e.id === sel.id));
                    return [...prev, ...newExercises];
                  });
                }}
                className="btn btn-primary text-lg"
              >
                Add ({selectedExercise.length})
              </button>
            </div>
            <ul>
              {mockExercises.map((mockExercise, idx) => (
                <li
                  key={mockExercise.id}
                  // Select several exercises in the list - if already selected, deselect
                  onClick={() =>
                    setSelectedExercise(prev =>
                      prev.some(item => item.id === mockExercise.id)
                        ? prev.filter(item => item.id !== mockExercise.id)
                        : [...prev, { id: mockExercise.id, sets: 0, reps: 0, weight: 0, restTime: 0 }]
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
      <div>
        {editableExercises.map((exercise, idx) => (
          <div key={exercise.id} className="ml-2 mr-2 mt-5 mb-6 p-3 rounded-lg bg-gray-800">
            <div className="flex justify-between items-center">
              <div className="font-bold text-lg">{exercise.id}</div>
              <button onClick className="">
                ⛔️
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-300 mt-2 mb-1">
              <span>Sets</span>
              <span>Reps</span>
              <span>Weight</span>
              <span>Rest</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                value={exercise.sets?.toString() ?? ''}
                onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                className="bg-gray-700 rounded px-2 py-1 text-center"
                min={0}
              />
              <input
                type="number"
                value={exercise.reps?.toString() ?? ''}
                onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                className="bg-gray-700 rounded px-2 py-1 text-center"
                min={0}
              />
              <input
                type="number"
                value={exercise.weight?.toString() ?? ''}
                onChange={e => handleExerciseChange(idx, 'weight', e.target.value)}
                className="bg-gray-700 rounded px-2 py-1 text-center"
                min={0}
              />
              <input
                type="number"
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
  );
}

export default CreatePlan;
