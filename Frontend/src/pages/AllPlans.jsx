import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { setCookie, getCookie } from '../utils/cookieUtils.js';

const AllPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
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
    getMyPlans();
  }, []);

  return (
    <>
      {/* Main AllPlans View */}
      {!selectedPlan ? (
        <div className="min-h-screen bg-[#f8f8f8] text-black font-montserrat p-4 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold mb-4">All My Plans</h2>
            <button
              onClick={goToPlans}
              className="bg-[#3b82f6] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Back
            </button>
          </div>

          {isLoading ? (
            <p className="text-center text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="flex flex-col gap-4">
              {plans.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">No plans found.</p>
              ) : (
                plans.map(plan => (
                  <div key={plan._id} className="bg-black text-white p-4 rounded-md">
                    <h4 className="font-semibold mb-1 text-base">{plan.name}</h4>
                    <p className="text-base mb-3">
                      {plan.exercise?.map((exercise, i) => (
                        <span key={exercise._id}>
                          Sets: {exercise.sets}, Reps: {exercise.reps}, Weight: {exercise.weight}kg
                          {i !== plan.exercise.length - 1 && ' | '}
                        </span>
                      )) || 'No exercises'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => GoToStartRoutine(plan._id)}
                        className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                      >
                        Start Routine
                      </button>
                      <button
                        onClick={() => handleCreateActivity(plan)}
                        className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
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
      ) : (
        /* Create Activity Modal */
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Create Group Activity</h2>
              <button onClick={handleCloseActivityForm} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Plan:</strong> {selectedPlan.name}
              </p>
              {selectedPlan.exercise && (
                <p className="text-sm text-gray-600">
                  <strong>Exercises:</strong>{' '}
                  {selectedPlan.exercise
                    .map(ex => ex.exerciseDetails?.[0]?.name || ex.name || `Exercise ${ex.exerciseId}`)
                    .join(', ')}
                </p>
              )}
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gym/Location *</label>
                <input
                  type="text"
                  value={activityForm.gym}
                  onChange={e => handleFormChange('gym', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  placeholder="e.g., McFit Downtown"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={activityForm.time}
                  onChange={e => handleFormChange('time', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={activityForm.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-black h-20"
                  placeholder="Describe the workout activity..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                <input
                  type="number"
                  value={activityForm.attendeessLimit}
                  onChange={e => handleFormChange('attendeessLimit', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-black"
                  min="1"
                  max="20"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseActivityForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitActivity}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AllPlans;
