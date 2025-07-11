import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import checkAuth from '../data/checkAuth';
import { setCookie, getCookie } from '../utils/cookieUtils.js';

const Plans = () => {
  const navigate = useNavigate();

  const [recommendedPlans, setRecommendedPlans] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedRecommendedPlan, setSelectedRecommendedPlan] = useState(null);
  const [activityForm, setActivityForm] = useState({
    gym: '',
    time: '',
    description: '',
    attendeessLimit: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Handle creating activity from plan
  const handleCreateActivity = plan => {
    setSelectedPlan(plan);
    // Pre-fill description with plan exercises
    const exerciseNames =
      plan.exercise?.map(ex => ex.exerciseDetails?.[0]?.name || ex.name || `Exercise ${ex.exerciseId}`).join(', ') ||
      'Workout session';

    setActivityForm({
      gym: '',
      time: '',
      description: `Join me for: ${exerciseNames}`,
      attendeessLimit: 5
    });
  };

  const handleCloseActivityForm = () => {
    setSelectedPlan(null);
    setActivityForm({
      gym: '',
      time: '',
      description: '',
      attendeessLimit: 5
    });
  };

  const handleViewRecommendedPlan = plan => {
    setSelectedRecommendedPlan(plan);
  };

  const handleCloseRecommendedPlanModal = () => {
    setSelectedRecommendedPlan(null);
  };

  const handleFormChange = (field, value) => {
    setActivityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Extract and map body parts from plan exercises to LFG format
  const extractBodyParts = plan => {
    const bodyPartsSet = new Set();

    plan.exercise?.forEach(exercise => {
      if (exercise.exerciseDetails?.[0]?.bodyPart) {
        bodyPartsSet.add(exercise.exerciseDetails[0].bodyPart);
      }
    });

    // Create LFG body parts object
    const bodyPartsObj = {};
    bodyPartsSet.forEach(bodyPart => {
      // Map common body parts to LFG schema fields
      const mapping = {
        chest: 'pectorals',
        back: 'lats',
        shoulders: 'deltes',
        legs: 'quads',
        arms: 'biceps',
        cardio: 'cardiovascularSystem',
        waist: 'abs'
      };

      const mappedField = mapping[bodyPart.toLowerCase()] || bodyPart.toLowerCase();
      bodyPartsObj[mappedField] = bodyPart;
    });

    return [bodyPartsObj];
  };

  const handleSubmitActivity = async () => {
    if (!selectedPlan || !activityForm.gym || !activityForm.description) {
      alert('Please fill in all required fields (Gym and Description)');
      return;
    }

    try {
      setIsSubmitting(true);
      const userId = getCookie('userId');
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const activityData = {
        userId: userId,
        name: selectedPlan.name,
        description: activityForm.description,
        gym: activityForm.gym,
        time: activityForm.time,
        showWorkoutPlan: true,
        workoutPlanId: selectedPlan._id,
        attendeessLimit: parseInt(activityForm.attendeessLimit),
        attendess: [],
        bodyParts: extractBodyParts(selectedPlan)
      };

      const response = await fetch(`${BACKEND_URL}/lfg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create activity');
      }

      const createdActivity = await response.json();
      console.log('Activity created successfully:', createdActivity);
      alert('✅ Activity created successfully! Others can now find and join your workout.');
      handleCloseActivityForm();
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('❌ Failed to create activity: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
    <>
      {/* Main Plans View */}
      {!selectedPlan && !selectedRecommendedPlan ? (
        <div className="min-h-screen bg-[#121212] text-white font-montserrat p-4 pt-safe pb-safe space-y-8">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] p-6 rounded-2xl w-full max-w-md shadow-2xl border border-gray-700 mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Templates</h2>
              <button
                onClick={GoToCreatePlan}
                className="bg-[#F2AB40] hover:bg-[#e09b2d] text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                + Template
              </button>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-white">My Pinned Plans</h3>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <p className="text-gray-400">Loading your plans...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {plans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No personal plans found.</p>
                    <button
                      onClick={GoToCreatePlan}
                      className="bg-[#F2AB40] text-black px-4 py-2 rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
                    >
                      Create your first plan
                    </button>
                  </div>
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
                      <div
                        key={plan._id}
                        className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                      >
                        <h4 className="font-semibold mb-2 text-lg text-white">{plan.name}</h4>
                        <p className="text-sm mb-3 text-gray-400">{exerciseList}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => GoToStartRoutine(plan._id)}
                            className="bg-[#F2AB40] text-black px-3 py-1 text-sm rounded hover:bg-[#e09b2d] transition-colors font-semibold"
                          >
                            Start Routine
                          </button>
                          <button
                            onClick={() => handleCreateActivity(plan)}
                            className="bg-[#1a1a1a] border border-gray-600 text-white px-3 py-1 text-sm rounded hover:border-[#F2AB40] hover:bg-[#F2AB40] hover:text-black transition-colors font-semibold"
                          >
                            Create Activity
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {plans.length > 0 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={GoToSeeAllMyPlans}
                  className="w-full text-center py-2 text-[#F2AB40] hover:text-[#e09b2d] transition-colors"
                >
                  See All My Plans →
                </button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 mb-20 shadow-lg border border-gray-600">
            <h2 className="text-xl font-bold mb-4 text-white">Recommended Plans</h2>

            <div className="space-y-4">
              {recommendedPlans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No recommended plans available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              exercise.setDetails.reduce((sum, set) => sum + set.weight, 0) /
                              exercise.setDetails.length;
                            const avgReps =
                              exercise.setDetails.reduce((sum, set) => sum + set.reps, 0) / exercise.setDetails.length;
                            return `${truncatedName}: ${exercise.sets} sets, ~${avgReps.toFixed(
                              0
                            )} reps, ~${avgWeight}kg`;
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
                      <div
                        key={plan._id}
                        onClick={() => handleViewRecommendedPlan(plan)}
                        className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                      >
                        <h4 className="font-semibold text-white mb-2">{plan.name}</h4>
                        <p className="text-sm text-gray-400 leading-tight">{exerciseList}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : selectedPlan ? (
        /* Create Activity Modal */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 w-full max-w-md border border-gray-600 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create Group Activity</h2>
              <button
                onClick={handleCloseActivityForm}
                className="text-gray-400 hover:text-[#F2AB40] text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="mb-4 bg-[#1a1a1a] rounded-lg p-3 border border-gray-600">
              <p className="text-sm text-gray-300 mb-2">
                <strong className="text-[#F2AB40]">Plan:</strong> {selectedPlan.name}
              </p>
              {selectedPlan.exercise && (
                <p className="text-sm text-gray-300">
                  <strong className="text-[#F2AB40]">Exercises:</strong>{' '}
                  {selectedPlan.exercise
                    .map(ex => ex.exerciseDetails?.[0]?.name || ex.name || `Exercise ${ex.exerciseId}`)
                    .join(', ')}
                </p>
              )}
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Gym/Location *</label>
                <input
                  type="text"
                  value={activityForm.gym}
                  onChange={e => handleFormChange('gym', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="e.g., McFit Downtown"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  value={activityForm.time}
                  onChange={e => handleFormChange('time', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                <textarea
                  value={activityForm.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors h-20 resize-none"
                  placeholder="Describe the workout activity..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Max Attendees</label>
                <input
                  type="number"
                  value={activityForm.attendeessLimit}
                  onChange={e => handleFormChange('attendeessLimit', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  min="1"
                  max="20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseActivityForm}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 rounded-lg hover:border-[#F2AB40] hover:text-white transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitActivity}
                  className="flex-1 px-4 py-2 bg-[#F2AB40] text-black rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : selectedRecommendedPlan ? (
        /* Recommended Plan Details Modal */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 w-full max-w-lg border border-gray-600 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{selectedRecommendedPlan.name}</h2>
              <button
                onClick={handleCloseRecommendedPlanModal}
                className="text-gray-400 hover:text-[#F2AB40] text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedRecommendedPlan.exercise && selectedRecommendedPlan.exercise.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-[#F2AB40]">Total Exercises:</strong>{' '}
                      {selectedRecommendedPlan.exercise.length}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedRecommendedPlan.exercise.map((exercise, index) => {
                      const exerciseName =
                        exercise.exerciseDetails?.[0]?.name || exercise.name || `Exercise ${exercise.exerciseId}`;
                      const bodyPart = exercise.exerciseDetails?.[0]?.bodyPart || 'Unknown';

                      return (
                        <div key={index} className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                          <h4 className="font-semibold text-white mb-2">{exerciseName}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Body Part:</span>
                              <span className="text-[#F2AB40] ml-2 capitalize">{bodyPart}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Sets:</span>
                              <span className="text-white ml-2">{exercise.sets || 0}</span>
                            </div>
                          </div>

                          {exercise.setDetails && exercise.setDetails.length > 0 ? (
                            <div className="mt-3">
                              <p className="text-gray-400 text-xs mb-2">Set Details:</p>
                              <div className="space-y-1">
                                {exercise.setDetails.map((set, setIndex) => (
                                  <div key={setIndex} className="text-xs text-gray-300 flex justify-between">
                                    <span>Set {setIndex + 1}:</span>
                                    <span>
                                      {set.reps} reps × {set.weight}kg
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Reps:</span>
                                <span className="text-white ml-2">{exercise.reps || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Weight:</span>
                                <span className="text-white ml-2">{exercise.weight || 0}kg</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No exercises found in this plan</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-600">
                <button
                  onClick={handleCloseRecommendedPlanModal}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 rounded-lg hover:border-[#F2AB40] hover:text-white transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseRecommendedPlanModal();
                    handleCreateActivity(selectedRecommendedPlan);
                  }}
                  className="flex-1 px-4 py-2 bg-[#F2AB40] text-black rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
                >
                  Create Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Plans;
