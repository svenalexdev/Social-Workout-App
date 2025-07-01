import { useNavigate } from 'react-router';

export const mockPlans = [
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

const AllPlans = () => {
  const navigate = useNavigate();

  // const goHome = () => {
  //   navigate('/');
  // };

  const goToPlans = () => {
    navigate('/plans');
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black font-montserrat p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold mb-4">All My Plans</h2>
        <button onClick={goToPlans} className="bg-[#3b82f6] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
          Back Home
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {mockPlans.map(plan => (
          <div key={plan._id} className="bg-black text-white p-4 rounded-md">
            <h4 className="font-semibold mb-1 text-base">{plan.title}</h4>
            <p className="text-base mb-3">{plan.exercises.join(' ')}</p>
            <button className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700">
              Start Routine
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllPlans;
