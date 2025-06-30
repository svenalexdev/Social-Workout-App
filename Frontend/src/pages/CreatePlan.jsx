import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// What is needed
// 2
// - X button top left that navigates back to general workout plan area (useNavigate)
// - headline in the top middle that changes according to naming
// - Save button top right to save created plan / template (localStorage / CRUD push to database?)
// - another headline
// - edit button next to this headline to change name (useState, useEffect? change headline in top as well)
// - add exercises button that opens up 2.1 view (useState, useEffect?)
// - add AI button (no functionality yet + if add exercise button is used, make it disappear)
// 2.1
// - create mock data exercises
// - open up list of mock exercises (if time: check popup functionality)
// - on click of exercise, activate "add" button (localStorage?)
// - when clicking on add button, list the chosen exercise in 2 (localStorage?)
// - search field
// - any body part button (mock data body parts?) that opens up dropdown?
// - any category button (mock data body parts?) that opens up dropdown?
// - sort button

function CreatePlan() {
  let mockExercises = [
    'Ab Wheel',
    'Back Extension',
    'Ball Slams',
    'Battle Ropes',
    'Bench Dip',
    'Bench Press',
    'Bicep Curl',
    'Burpee',
    'Chest Dip',
    'Deadlift',
    'Front Raise',
    'Hip Thrust',
    'Incline Curl',
    'Jump Squat',
    'Kettlebell Swing',
    'Leg Press'
  ];

  // const [planName, setPlanName] = useState();

  const [showExercises, setShowExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate('/plans');
  };

  const displayMockExercises = () => {};

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
              Add (number)
            </button>
          </div>
          <ul>
            {mockExercises.map(mockExercise => (
              <li
                key={mockExercise}
                // mark selected exercise with color
                onClick={() => {
                  setSelectedExercise(mockExercise);
                }}
                className={`text-xl font-bold mt-2 ${
                  selectedExercise === mockExercise ? 'bg-green-800' : 'hover:bg-slate-600'
                }`}
              >
                {mockExercise}
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
