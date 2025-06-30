import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// What is needed
// 2
// - X button top left that navigates back to general workout plan area (useNavigate)
// - headline in the top middle
// - Save button top right to save created plan / template (localStorage / CRUD push to database?)
// - another headline
// - edit button next to this headline to change name (useState, useEffect? change headline in top as well)
// - add exercises button that opens up 2.1 view (useState?)
// - add AI button (no functionality yet + if add exercise button is used, make it disappear)
// 2.1
// - create mock data exercises
// - open up list of mock exercises (if time: check popup/modal functionality)
// - on click of exercise, activate "add" button (localStorage?)
// - when clicking on add button, list the chosen exercise in 2(.2) (localStorage?)
// - search field?
// (- any body part button (mock data body parts?) that opens up dropdown?
// - any category button (mock data body parts?) that opens up dropdown?
// - sort button)

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

  const [showExercises, setShowExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState([]);
  // const [planName, setPlanName] = useState();

  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate('/plans');
  };

  // store selected exercise to localStorage
  useEffect(() => {
    if (selectedExercise) {
      localStorage.setItem('exercises', JSON.stringify(selectedExercise));
      console.log(selectedExercise);
    }
  }, [selectedExercise]);

  // const handleAddExercises = e => {
  //   e.preventDefault();
  //   const exercises = JSON.parse(localStorage.getItem('exercises')) || [];
  // };

  // // await createPlan(createdPlan); // CRUD

  return (
    <div>
      <div className="flex justify-around items-center">
        <button onClick={handleGoBack} className="btn btn-primary text-lg">
          X
        </button>
        <h1 className="text-center font-bold text-lg">New Template</h1>
        <button className="btn btn-primary text-lg">Save</button>
      </div>
      <div className="flex mt-12 items-center justify-center">
        <h2 className="text-2xl font-bold p-3">New Template</h2>
        <button className="btn btn-primary text-lg">Edit</button>
      </div>
      <div className="flex justify-center mt-8">
        <button onClick={() => setShowExercises(!showExercises)} className="btn btn-primary w-xs text-lg">
          Add exercises manually
        </button>
      </div>
      {showExercises && (
        <div className="mt-10 bg-slate-700 p-3 px-5 ml-3 mr-3 rounded-2xl">
          <div className="flex justify-end">
            {/* localStorage to save chosen exercises */}
            <button onClick={() => setShowExercises(!showExercises)} className="btn btn-primary text-lg">
              Add ({selectedExercise.length})
            </button>
          </div>
          <ul>
            {mockExercises.map(mockExercise => (
              <li
                key={mockExercise.id}
                // select several exercises in list - if click on already selected, deselect
                onClick={() => {
                  setSelectedExercise(prev =>
                    prev.some(item => item.id === mockExercise.id)
                      ? prev.filter(item => item.id !== mockExercise.id)
                      : [...prev, mockExercise]
                  );
                }}
                // mark selected exercise with color
                className={`text-xl font-bold mt-2 ${
                  selectedExercise.some(item => item.id === mockExercise.id) ? 'bg-green-800' : 'hover:bg-slate-600'
                }`}
              >
                {mockExercise.name} <br />
                <span className="text-sm">{mockExercise.bodyPart}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex justify-center mt-40">
        <button className="btn btn-primary h-35 w-35 text-lg">
          Create Plan <br /> with AI
        </button>
      </div>
    </div>
  );
}

export default CreatePlan;
