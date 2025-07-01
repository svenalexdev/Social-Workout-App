import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';

// object array data
const mockPlans = [
  {
    _id: '1',
    title: 'Chest & Triceps',
    exercises: ['Tricep Dips – 3 x 12', 'Overhead Dumbbell Extension – 3 x 10', 'Grip Bench Press – 4 x 8']
  },
  {
    _id: '2',
    title: 'Back & Biceps',
    exercises: ['Deadlifts – 4 x 6', 'Barbell Rows – 3 x 10', 'Bicep Curls – 3 x 12']
  },
  {
    _id: '3',
    title: 'Leg Day',
    exercises: ['Barbell Squats – 4 x 8', 'Lunges – 3 x 12', 'Leg Press – 3 x 10']
  },
  {
    _id: '4',
    title: 'Shoulders & Core',
    exercises: ['Shoulder Press – 3 x 10', 'Lateral Raises – 3 x 15', 'Planks – 3 x 60 sec']
  },
  {
    _id: '5',
    title: 'HIIT Cardio',
    exercises: ['Jump Squats – 30 sec', 'Mountain Climbers – 45 sec', 'Burpees – 20 reps']
  },
  {
    _id: '6',
    title: 'Full Body',
    exercises: ['Deadlifts – 4 x 6', 'Bench Press – 3 x 10', 'Barbell Squats – 3 x 8']
  },
  {
    _id: '7',
    title: 'Push Day Strength',
    exercises: ['Bench Press – 5 x 5', 'Overhead Press – 4 x 6', 'Skullcrushers – 3 x 10']
  },
  {
    _id: '8',
    title: 'Core Burnout',
    exercises: ['Leg Raises – 3 x 20', 'Russian Twists – 3 x 40', 'Plank – 3 x 90 sec']
  },
  {
    _id: '9',
    title: 'Arms Isolation',
    exercises: ['Concentration Curl – 3 x 12', 'Tricep Kickbacks – 3 x 15', 'Preacher Curl – 3 x 10']
  },
  {
    _id: '10',
    title: 'Mobility & Stretching',
    exercises: ['Hamstring Stretch – 2 min', 'Cat-Cow – 10 reps', 'Pigeon Pose – 1 min each side']
  }
];

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [recommendedPlans, setRecommendedPlans] = useState([]);

  const GoToCreatePlan = () => {
    navigate('/createplan');
  };

  const GoToStartRoutine = () => {
    navigate('/exercisingplan');
  };

  const GoToSeeAllMyPlans = () => {
    navigate('/seeallmyplans');
  };

  useEffect(() => {
    // axios
    //   .get('https://finalproject-backend-y98m.onrender.com/plans')
    //   .then(response => {
    //     const publicPlans = response.data.filter(plan => plan.isPublic);
    //     setRecommendedPlans(publicPlans.slice(0, 4));
    //   })
    //   .catch(error => {
    //     console.error('Error fetching recommended plans:', error);
    //   });

    setPlans(mockPlans);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-montserrat p-4 space-y-8">
      <div className="bg-[#d8d8d85a] p-4 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">Templates</h2>
          <button
            onClick={GoToCreatePlan}
            className="bg-[#3b82f6] hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
          >
            + Template
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-2">My Pinned Plans</h3>

        <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto">
          {plans.map(plan => (
            <div key={plan._id} className="bg-black text-white p-4 rounded-md">
              <h4 className="font-semibold mb-1">{plan.title}</h4>
              <p className="text-sm mb-3">{plan.exercises.slice(0, 3).join(' ')}</p>
              <button
                onClick={GoToStartRoutine}
                className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
              >
                Start Routine
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={GoToSeeAllMyPlans}
            className="bg-[#3b82f6] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
          >
            See All My Plans
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-3">Recommended Plans</h2>

        <div className="bg-[#d8d8d8] p-4 rounded-lg text-black">
          <div className="flex gap-4">
            <div className="bg-[#f8f8f8] p-3 rounded-md text-sm w-1/2">
              <p className="font-semibold text-xl">Strong 5x5 - Workout B</p>
              <p className="text-xl">Squat (Barbell), Overhead Press (Barbell), Deadlift (Barbell)</p>
            </div>

            <div className="bg-[#f8f8f8] p-3 rounded-md text-sm w-1/2">
              <p className="font-semibold text-xl">Legs</p>
              <p className="text-xl">Squat (Barbell), Leg Extension (Machine), Flat Leg Raise, Calf Raise</p>
            </div>
          </div>
        </div>

        <div className="bg-[#d8d8d8] p-4 rounded-lg text-black">
          <div className="flex gap-4">
            <div className="bg-[#f8f8f8] p-3 rounded-md text-sm w-1/2">
              <p className="font-semibold text-xl">Strong 5x5 - Workout B</p>
              <p className="text-xl">Squat (Barbell), Overhead Press (Barbell), Deadlift (Barbell)</p>
            </div>

            <div className="bg-[#f8f8f8] p-3 rounded-md text-sm w-1/2">
              <p className="font-semibold text-xl">Legs</p>
              <p className="text-xl">Squat (Barbell), Leg Extension (Machine), Flat Leg Raise, Calf Raise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
