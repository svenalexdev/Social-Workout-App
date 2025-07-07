import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import checkAuth from '../data/checkAuth';
import { setCookie, getCookie } from '../utils/cookieUtils.js';


const Plans = () => {
  const navigate = useNavigate();

  const [recommendedPlans, setRecommendedPlans] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const GoToCreatePlan = () => {
    navigate('/createplan');
  };

  const GoToStartRoutine = planId => {
    if (planId) {
      setCookie('exerciseId', planId); // Store plan ID in cookies for iOS compatibility
    }
    navigate('/exercisingplan');
  };

  const GoToSeeAllMyPlans = () => {
    navigate('/allplans');
  };

  useEffect(() => {
    const verifyUser = async () => {
      const login = await checkAuth();
      if (!login) {
        alert('User not login');
        navigate('/signin');
      }
    };
    verifyUser();

    (async () => {
      try {
        const BACKEND_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${BACKEND_URL}/plans`);
        const data = await response.json();

        // Filter for public plans and take first 6
        const publicPlans = data.filter(plan => plan.isPublic);
        setRecommendedPlans(publicPlans.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch recommended plans:', error.message);
      }
    })();

    // Also fetch user's personal plans
    getMyPlans();
  }, []);

  const getMyPlans = async () => {
    try {
      setIsLoading(true);
      const BACKEND_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${BACKEND_URL}/plans`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch personal plans');
      }
      const data = await res.json();
      const userIdCookie = getCookie('userId'); // Get user ID from cookies
      const userPlans = data.filter(plan => plan.userId && plan.userId === userIdCookie);
      setPlans(userPlans);
    } catch (error) {
      console.error('Error fetching plan data:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

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

        {isLoading ? (
          <p className="text-center text-sm text-gray-500">Loading your plans...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {plans.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No personal plans found.</p>
            ) : (
              plans.slice(0, 3).map(plan => {
                const hasExercises = plan.exercise && plan.exercise.length > 0;
                let exerciseList = 'No exercises';

                if (hasExercises) {
                  exerciseList = plan.exercise
                    .slice(0, 2) // Show first 2 exercises
                    .map(exercise => {
                      const exerciseName =
                        exercise.exerciseDetails && exercise.exerciseDetails.length > 0
                          ? exercise.exerciseDetails[0].name
                          : exercise.name || `Exercise ${exercise.exerciseId}`;

                      const truncatedName =
                        exerciseName.length > 20 ? exerciseName.substring(0, 20) + '...' : exerciseName;

                      return `${truncatedName} (${exercise.sets} sets)`;
                    })
                    .join(', ');

                  if (plan.exercise.length > 2) {
                    exerciseList += `, +${plan.exercise.length - 2} more`;
                  }
                }

                return (
                  <div key={plan._id} className="bg-black text-white p-4 rounded-md">
                    <h4 className="font-semibold mb-1 text-base">{plan.name}</h4>
                    <p className="text-sm mb-3 text-gray-300">{exerciseList}</p>
                    <button
                      onClick={() => GoToStartRoutine(plan._id)}
                      className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                    >
                      Start Routine
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recommendedPlans.map(plan => {
              const hasExercises = plan.exercise && plan.exercise.length > 0;
              let exerciseList = 'No exercises';

              if (hasExercises) {
                exerciseList = plan.exercise
                  .slice(0, 2) // Limit to first 2 exercises to avoid too much text
                  .map(exercise => {
                    // Get exercise name from exerciseDetails if available
                    const exerciseName =
                      exercise.exerciseDetails && exercise.exerciseDetails.length > 0
                        ? exercise.exerciseDetails[0].name
                        : exercise.name || `Exercise ${exercise.exerciseId}`;

                    // Truncate exercise name if too long
                    const truncatedName =
                      exerciseName.length > 15 ? exerciseName.substring(0, 15) + '...' : exerciseName;

                    // Show sets count and setDetails info if available
                    if (exercise.setDetails && exercise.setDetails.length > 0) {
                      const avgWeight =
                        exercise.setDetails.reduce((sum, set) => sum + set.weight, 0) / exercise.setDetails.length;
                      const avgReps =
                        exercise.setDetails.reduce((sum, set) => sum + set.reps, 0) / exercise.setDetails.length;
                      return `${truncatedName}: ${exercise.sets} sets, ~${avgReps.toFixed(0)} reps, ~${avgWeight}kg`;
                    } else {
                      // Fallback to old structure
                      return `${truncatedName}: ${exercise.sets} sets, ${exercise.reps || 0} reps, ${
                        exercise.weight || 0
                      }kg`;
                    }
                  })
                  .join(' | ');

                // Add "..." if there are more than 2 exercises
                if (plan.exercise.length > 2) {
                  exerciseList += ` | +${plan.exercise.length - 2} more...`;
                }
              }

              // Truncate the entire exercise list if it's still too long
              const maxLength = 80;
              if (exerciseList.length > maxLength) {
                exerciseList = exerciseList.substring(0, maxLength) + '...';
              }

              return (
                <div key={plan._id} className="bg-[#f8f8f8] p-3 rounded-md">
                  <p className="font-semibold text-base mb-1">{plan.name}</p>
                  <p className="text-sm text-gray-600 leading-tight">{exerciseList}</p>
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
