import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { mockPlans } from './AllPlans';

const Plans = () => {
  const navigate = useNavigate();
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
    (async () => {
      try {
        const response = await fetch('https://finalproject-backend-y98m.onrender.com/plans');
        const data = await response.json();
        // console.log('plans:', data);
        const publicPlans = data.filter(plan => plan.isPublic);
        setRecommendedPlans(publicPlans.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch recommended plans:', error.message);
      }
    })();
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

        <div className="flex flex-col gap-4">
          {mockPlans.slice(0, 3).map(plan => (
            <div key={plan._id} className="bg-black text-white p-4 rounded-md">
              <h4 className="font-semibold mb-1 text-base">{plan.title}</h4>
              <p className="text-base mb-3">{plan.exercises.slice(0, 3).join(' ')}</p>
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

        <div className="bg-[#d8d8d8] p-4">
          <div className="grid grid-cols-2 gap-4">
            {recommendedPlans.map(plan => {
              const hasExercises = plan.exercise && plan.exercise.length > 0;
              const exerciseList = hasExercises
                ? plan.exercise
                    .map(exercise => {
                      return `Sets: ${exercise.sets}, Reps: ${exercise.reps}, Weight: ${exercise.weight}kg`;
                    })
                    .join(' | ')
                : 'No exercises';

              return (
                <div key={plan._id} className="bg-[#f8f8f8] p-3 rounded-md">
                  <p className="font-semibold text-base mb-1">{plan.name}</p>
                  <p className="text-base">{exerciseList}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
