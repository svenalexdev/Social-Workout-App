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
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
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

  const handleViewPlanDetails = plan => {
    setSelectedPlanDetails(plan);
  };

  const handleClosePlanDetailsModal = () => {
    setSelectedPlanDetails(null);
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
      // alert('✅ Activity created successfully! Others can now find and join your workout.');
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
      {!selectedPlan && !selectedRecommendedPlan && !selectedPlanDetails ? (
        <div className="bg-[#121212] text-white min-h-screen pt-safe pb-5 w-full max-w-md mx-auto">
          <div className="p-6 pb-2">
            {/* Enhanced Header Section */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex justify-between items-center w-full">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Plans
                </h2>
                <button
                  onClick={GoToCreatePlan}
                  className="bg-[#F2AB40] hover:bg-[#e09b2d] text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  + Create Plan
                </button>
              </div>
            </div>
          </div>

          {/* My Pinned Plans Section */}
          <div className="p-6 pt-2">
            <h3 className="text-2xl font-semibold mb-4">My Pinned Plans</h3>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <p className="text-gray-400">Loading plans...</p>
                </div>
              </div>
            ) : plans.length > 0 ? (
              <div className="space-y-4">
                {plans.slice(0, 3).map(plan => {
                  const hasExercises = plan.exercise && plan.exercise.length > 0;
                  let exerciseList = 'No exercises';

                  if (hasExercises) {
                    exerciseList = plan.exercise
                      .slice(0, 2)
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
                      onClick={() => handleViewPlanDetails(plan)}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                    >
                      <h4 className="font-semibold text-white mb-2">{plan.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">{exerciseList}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span>{plan.exercise ? `${plan.exercise.length} exercises` : 'No exercises'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            GoToStartRoutine(plan._id);
                          }}
                          className="flex-1 text-sm bg-[#F2AB40] text-black px-3 py-2 rounded-full font-medium hover:bg-[#e09b2d] transition-colors"
                        >
                          Start Routine
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleCreateActivity(plan);
                          }}
                          className="flex-1 text-sm bg-gray-600 text-white px-3 py-2 rounded-full font-medium hover:bg-[#F2AB40] hover:text-black transition-colors"
                        >
                          Create Activity
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* See All Plans Button */}
                <button
                  onClick={GoToSeeAllMyPlans}
                  className="w-full text-center py-3 text-[#F2AB40] transition-colors rounded-lg hover:bg-[#F2AB40] hover:text-black font-semibold mt-4"
                >
                  See All My Plans →
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No plans created yet</p>
                <button
                  onClick={GoToCreatePlan}
                  className="bg-[#F2AB40] text-black px-4 py-2 rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
                >
                  Create your first plan
                </button>
              </div>
            )}
          </div>

          {/* Recommended Plans Section */}
          {/* <div className="p-6 pt-2">
            <h3 className="text-2xl font-semibold mb-4">Recommended Plans</h3>

            <div className="space-y-4">
              {recommendedPlans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No recommended plans available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedPlans.slice(0, 3).map(plan => {
                    const hasExercises = plan.exercise && plan.exercise.length > 0;
                    let exerciseList = 'No exercises';

                    if (hasExercises) {
                      exerciseList = plan.exercise
                        .slice(0, 2)
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
                        onClick={() => handleViewRecommendedPlan(plan)}
                        className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white text-lg">{plan.name}</h4>
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Public</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{exerciseList}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleCreateActivity(plan);
                            }}
                            className="flex-1 bg-[#F2AB40] text-black px-4 py-2 rounded-full text-sm hover:bg-[#e09b2d] transition-colors font-medium"
                          >
                            Create Activity
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {recommendedPlans.length > 3 && (
                    <button
                      onClick={() => navigate('/plans')}
                      className="w-full text-center py-2 text-[#F2AB40] hover:text-[#e09b2d] transition-colors"
                    >
                      View all recommended plans →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div> */}
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
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
      ) : selectedPlanDetails ? (
        /* Personal Plan Details Modal */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 w-full max-w-lg border border-gray-600 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{selectedPlanDetails.name}</h2>
              <button
                onClick={handleClosePlanDetailsModal}
                className="text-gray-400 hover:text-[#F2AB40] text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedPlanDetails.exercise && selectedPlanDetails.exercise.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-[#F2AB40]">Total Exercises:</strong> {selectedPlanDetails.exercise.length}
                    </p>
                    {selectedPlanDetails.isPublic && (
                      <p className="text-green-400 text-sm mt-1">
                        <strong>✓ Public Plan</strong> - Visible to other users
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedPlanDetails.exercise.map((exercise, index) => {
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
                  onClick={handleClosePlanDetailsModal}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 rounded-lg hover:border-[#F2AB40] hover:text-white transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => GoToStartRoutine(selectedPlanDetails._id)}
                  className="flex-1 px-4 py-2 bg-[#F2AB40] text-black rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
                >
                  Start Routine
                </button>
                <button
                  onClick={() => {
                    handleClosePlanDetailsModal();
                    handleCreateActivity(selectedPlanDetails);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
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
