import { useNavigate } from 'react-router';
import { useAuth } from '../context/index.js';
import { useState, useEffect } from 'react';
import { getCookie, setCookie, deleteCookie } from '../utils/cookieUtils';

function Home() {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [recommendedPlans, setRecommendedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [activityForm, setActivityForm] = useState({
    gym: '',
    time: '',
    description: '',
    attendeessLimit: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const BACKEND_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${BACKEND_URL}/lfg`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setActivities(data || []);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const BACKEND_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${BACKEND_URL}/plans`);

        if (response.ok) {
          const data = await response.json();
          const userIdCookie = getCookie('userId');
          const userPlans = data.filter(plan => plan.userId && plan.userId === userIdCookie);
          setPlans(userPlans);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      } finally {
        setPlansLoading(false);
      }
    };

    const fetchRecommendedPlans = async () => {
      try {
        setRecommendedLoading(true);
        const BACKEND_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${BACKEND_URL}/plans`);

        if (response.ok) {
          const data = await response.json();
          // Filter for public plans and take first 6
          const publicPlans = data.filter(plan => plan.isPublic);
          setRecommendedPlans(publicPlans.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching recommended plans:', err);
      } finally {
        setRecommendedLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchActivities();
      fetchPlans();
      fetchRecommendedPlans();
    } else {
      setLoading(false);
      setPlansLoading(false);
      setRecommendedLoading(false);
    }
  }, [isAuthenticated]);

  const GoToPlan = () => {
    navigate('/plans');
  };

  const GoToSignUp = () => {
    navigate('/signup');
  };

  const GoToSignIn = () => {
    navigate('/signin');
  };

  const GoToGroupFinder = () => {
    navigate('/groupfinder');
  };

  const GoToStartRoutine = planId => {
    if (planId) {
      setCookie('exerciseId', planId);
    }
    navigate('/exercisingplan');
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
      alert(' Activity created successfully! Others can now find and join your workout.');
      handleCloseActivityForm();
    } catch (error) {
      console.error('Error creating activity:', error);
      alert(' Failed to create activity: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();

    // Delete all cookies
    deleteCookie('userId');
    deleteCookie('sessionToken');
    deleteCookie('plan');
    deleteCookie('exercises');

    navigate('/'); // Redirect to home after logout
  };

  // If user is not authenticated, show login/signup options
  if (!isAuthenticated) {
    return (
      <div
        style={{
          backgroundImage: "url('/start-bg8.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        className="bg-[#121212] text-white fixed inset-0"
      >
        <div className="flex flex-col justify-center items-center w-full h-screen gap-y-80">
          <div>
            <p className="font-semibold mb-2 text-xl text-center">Welcome to</p>
            <h1 className="text-4xl font-semibold mb-5">Workout Tracker</h1>
          </div>
          <div>
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <button
                className="bg-[#F2AB40] text-black px-6 py-3 text-lg rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
                onClick={GoToSignUp}
              >
                Sign Up
              </button>
              <button
                className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] text-white px-6 py-3 text-lg rounded-lg hover:border-[#F2AB40] border border-gray-600 transition-all font-semibold"
                onClick={GoToSignIn}
              >
                Sign In
              </button>
            </div>
            <h2 className="mt-5 mb-5 font-semibold text-xl">Plan It. Share It. Sweat Together.</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] text-white min-h-screen pt-safe pb-5 w-full max-w-md mx-auto">
      <div className="p-8 pb-15">
        {/* Enhanced Greeting Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-[#F2AB40] to-[#e09b2d] rounded-full flex items-center justify-center text-black font-bold text-2xl shadow-lg ring-4 ring-[#F2AB40]/20">
              {user?.image ? (
                <img
                  src={user.image.startsWith('http') ? user.image : `${import.meta.env.VITE_API_URL}${user.image}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{(user?.username || user?.name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Hey <span className="text-[#F2AB40] font-extrabold">{user?.username || user?.name || 'User'}</span>
            </h2>
            <p className="text-gray-400 text-base font-medium tracking-wide whitespace-nowrap">
              Ready for your next training?
            </p>
          </div>
        </div>
      </div>

      {/* Pinned Plans Section */}
      <div className="p-6 pt-2">
        <h3 className="text-2xl font-semibold mb-4">My Pinned Plans</h3>

        {plansLoading ? (
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
                      exercise.exerciseDetails?.[0]?.name || exercise.name || `Exercise ${exercise.exerciseId}`;
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
                    <span>{new Date(plan.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation(); // Prevent card click event
                        GoToStartRoutine(plan._id);
                      }}
                      className="text-xs bg-[#F2AB40] text-black px-2 py-1 rounded-full font-medium"
                    >
                      Start Routine
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation(); // Prevent card click event
                        handleCreateActivity(plan);
                      }}
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full font-medium hover:bg-[#F2AB40] hover:text-black transition-colors"
                    >
                      Create Activity
                    </button>
                  </div>
                </div>
              );
            })}
            {plans.length > 3 && (
              <button
                onClick={() => navigate('/plans')}
                className="w-full text-center py-2 text-[#F2AB40] hover:text-[#e09b2d] transition-colors"
              >
                View all plans →
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No plans created yet</p>
            <button
              onClick={() => navigate('/plans')}
              className="bg-[#F2AB40] text-black px-4 py-2 rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
            >
              Create your first plan
            </button>
          </div>
        )}
      </div>

      {/* Community Workouts Section */}
      <div className="p-6 pt-2">
        <h3 className="text-2xl font-semibold mb-4">Community Workouts</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <p className="text-gray-400">Loading activities...</p>
            </div>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 3).map(activity => (
              <div
                key={activity._id}
                onClick={() => navigate('/groupfinder')}
                className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
              >
                <h4 className="font-semibold text-white mb-2">{activity.name}</h4>
                <p className="text-gray-400 text-sm mb-2">{activity.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                  <span>{activity.gym}</span>
                  <span>{new Date(activity.time).toLocaleDateString()}</span>
                </div>
                <div className="text-xs bg-[#F2AB40] text-black px-2 py-1 rounded-full font-medium inline-block">
                  {activity.attendees?.length || activity.attendess?.length || 0}/
                  {activity.attendeesLimit || activity.attendeessLimit} attendees
                </div>
              </div>
            ))}
            {activities.length > 3 && (
              <button
                onClick={GoToGroupFinder}
                className="w-full text-center py-2 text-[#F2AB40] hover:text-[#e09b2d] transition-colors"
              >
                View all activities →
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No activities posted yet</p>
            <button
              onClick={GoToGroupFinder}
              className="bg-[#F2AB40] text-black px-4 py-2 rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
            >
              Create your first activity
            </button>
          </div>
        )}
      </div>

      {/* Recommended Plans Section */}
      <div className="p-6 pt-2">
        <h3 className="text-2xl font-semibold mb-4 text-center">Recommended Plans</h3>

        {recommendedLoading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <p className="text-gray-400">Loading recommended plans...</p>
            </div>
          </div>
        ) : recommendedPlans.length > 0 ? (
          <div className="space-y-4">
            {recommendedPlans.slice(0, 3).map(plan => {
              const hasExercises = plan.exercise && plan.exercise.length > 0;
              let exerciseList = 'No exercises';

              if (hasExercises) {
                exerciseList = plan.exercise
                  .slice(0, 2)
                  .map(exercise => {
                    const exerciseName =
                      exercise.exerciseDetails?.[0]?.name || exercise.name || `Exercise ${exercise.exerciseId}`;
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
                      className="bg-[#F2AB40] text-black px-3 py-1 rounded text-xs hover:bg-[#e09b2d] transition-colors font-semibold"
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
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No recommended plans available</p>
          </div>
        )}
      </div>

      {/* Plan Details Modal */}
      {selectedPlanDetails && (
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
                        <strong>✓ Public Plan</strong> - Shared by the community
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
                  onClick={() => {
                    handleClosePlanDetailsModal();
                    handleCreateActivity(selectedPlanDetails);
                  }}
                  className="flex-1 px-4 py-2 bg-[#F2AB40] text-black rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
                >
                  Create Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Creation Modal */}
      {selectedPlan && (
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
      )}
    </div>
  );
}

export default Home;
