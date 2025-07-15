import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { setCookie, getCookie } from '../utils/cookieUtils.js';

const AllPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState(null);
  const [activityForm, setActivityForm] = useState({
    gym: '',
    time: '',
    description: '',
    attendeessLimit: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToPlans = () => {
    navigate('/plans');
  };

  const GoToStartRoutine = id => {
    setPlantoLs(id);
    navigate('/exercisingplan');
  };

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

  const setPlantoLs = id => {
    setCookie('exerciseId', id); // Store plan ID in cookies for iOS compatibility
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
    setSelectedPlanForDetails(plan);
  };

  const handleClosePlanDetailsModal = () => {
    setSelectedPlanForDetails(null);
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
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const activityData = {
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
      // alert('Activity created successfully! Others can now find and join your workout.');
      handleCloseActivityForm();
    } catch (error) {
      console.error('Error creating activity:', error);
      alert(' Failed to create activity: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getMyPlans();
  }, []);

  return (
    <>
      {/* Main AllPlans View */}
      {!selectedPlan && !selectedPlanForDetails ? (
        <div className="min-h-screen bg-[#121212] text-white font-montserrat p-4 pt-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold mb-4">All My Plans</h2>
            <button
              onClick={goToPlans}
              className="bg-[#F2AB40] hover:bg-[#e09b2d] text-black px-4 py-2 rounded-md text-sm"
            >
              Back
            </button>
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="flex flex-col gap-4">
              {plans.length === 0 ? (
                <p className="text-sm text-gray-400 text-center">No plans found.</p>
              ) : (
                plans.map(plan => (
                  <div
                    key={plan._id}
                    onClick={() => handleViewPlanDetails(plan)}
                    className="bg-[#1a1a1a] text-white p-4 rounded-md border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                  >
                    <h4 className="font-semibold mb-1 text-base">{plan.name}</h4>
                    <p className="text-base mb-3 text-gray-400">
                      {plan.exercise?.map((exercise, i) => (
                        <span key={exercise._id}>
                          Sets: {exercise.sets}, Reps: {exercise.reps}, Weight: {exercise.weight}kg
                          {i !== plan.exercise.length - 1 && ' | '}
                        </span>
                      )) || 'No exercises'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          GoToStartRoutine(plan._id);
                        }}
                        className="bg-[#F2AB40] text-black px-3 py-1 text-sm rounded hover:bg-[#e09b2d]"
                      >
                        Start Routine
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleCreateActivity(plan);
                        }}
                        className="bg-[#1a1a1a] border border-gray-600 text-white px-3 py-1 text-sm rounded hover:border-[#F2AB40] hover:bg-[#F2AB40] hover:text-black"
                      >
                        Create Activity
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : selectedPlan ? (
        /* Create Activity Modal */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-lg p-6 w-full max-w-md border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create Group Activity</h2>
              <button onClick={handleCloseActivityForm} className="text-gray-400 hover:text-[#F2AB40] text-2xl">
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
                  className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none"
                  placeholder="e.g., McFit Downtown"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={activityForm.time}
                  onChange={e => handleFormChange('time', e.target.value)}
                  className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                <textarea
                  value={activityForm.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none h-20"
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
                  className="w-full p-2 bg-[#1a1a1a] border border-gray-600 rounded-md text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none"
                  min="1"
                  max="20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseActivityForm}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 rounded-md hover:border-[#F2AB40] hover:text-white"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitActivity}
                  className="flex-1 px-4 py-2 bg-[#F2AB40] text-black rounded-md hover:bg-[#e09b2d] disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : selectedPlanForDetails ? (
        /* Plan Details Modal */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-xl p-6 w-full max-w-lg border border-gray-600 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{selectedPlanForDetails.name}</h2>
              <button
                onClick={handleClosePlanDetailsModal}
                className="text-gray-400 hover:text-[#F2AB40] text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedPlanForDetails.exercise && selectedPlanForDetails.exercise.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm">
                      <strong className="text-[#F2AB40]">Total Exercises:</strong>{' '}
                      {selectedPlanForDetails.exercise.length}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedPlanForDetails.exercise.map((exercise, index) => {
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
                    GoToStartRoutine(selectedPlanForDetails._id);
                  }}
                  className="flex-1 px-4 py-2 bg-[#F2AB40] text-black rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold"
                >
                  Start Routine
                </button>
                <button
                  onClick={() => {
                    handleClosePlanDetailsModal();
                    handleCreateActivity(selectedPlanForDetails);
                  }}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-600 text-white rounded-lg hover:border-[#F2AB40] hover:bg-[#F2AB40] hover:text-black transition-colors font-semibold"
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

export default AllPlans;
