import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { getCookie } from '../utils/cookieUtils';

const GroupFinder = () => {
  const navigate = useNavigate();

  // State management
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBodyparts, setSelectedBodyparts] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Fetch group activities from backend
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const userId = getCookie('userId');

        if (!userId) {
          throw new Error('User not logged in');
        }

        // Fetch all group activities, not just the user's own activities
        const BACKEND_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${BACKEND_URL}/lfg`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const activities = await response.json();
        setActivities(activities || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Handler
  // Handler to go back to plan page
  const handleGoBack = () => {
    navigate('/');
  };

  // Handle selecting bodyparts
  const handleSelect = part => {
    if (!selectedBodyparts.includes(part)) {
      setSelectedBodyparts([...selectedBodyparts, part]);
    }
  };

  // Handle removing bodyparts
  const handleRemove = part => {
    setSelectedBodyparts(selectedBodyparts.filter(p => p !== part));
  };

  // Handle opening activity details
  const handleActivityClick = activity => {
    setSelectedActivity(activity);
  };

  // Handle closing activity details
  const handleCloseDetails = () => {
    setSelectedActivity(null);
  };

  // Other
  // Predefined body parts for filtering
  const allBodyparts = [
    'back',
    'cardio',
    'chest',
    'lower arms',
    'lower legs',
    'neck',
    'shoulders',
    'upper arms',
    'upper legs',
    'waist'
  ];

  // Mapping from frontend filter terms to backend body part keys
  const bodyPartMapping = {
    back: ['lats', 'upperBack', 'traps'],
    cardio: ['cardiovascularSystem'],
    chest: ['pectorals'],
    'lower arms': ['forearms'],
    'lower legs': ['calves', 'hamStrings'],
    neck: ['levatorScapule'],
    shoulders: ['deltes', 'serratusAnterior'],
    'upper arms': ['biceps', 'triceps'],
    'upper legs': ['quads', 'glutes', 'adductors', 'abductors'],
    waist: ['abs', 'spin']
  };

  // Filter activities based on selected body parts
  const filteredActivities =
    selectedBodyparts.length > 0
      ? activities.filter(activity => {
          if (!activity.bodyParts || activity.bodyParts.length === 0) return false;

          return activity.bodyParts.some(bodyPartObj =>
            selectedBodyparts.some(selectedPart => {
              const mappedBodyParts = bodyPartMapping[selectedPart] || [];
              return mappedBodyParts.some(
                backendBodyPart => bodyPartObj[backendBodyPart] && bodyPartObj[backendBodyPart].trim() !== ''
              );
            })
          );
        })
      : activities;

  // Capitalize words and handle camelCase/compound words
  const capitalizeWords = str => {
    if (!str) return '';

    // Handle camelCase words like 'cardiovascularSystem' -> 'Cardiovascular System'
    const withSpaces = str.replace(/([a-z])([A-Z])/g, '$1 $2');

    return withSpaces.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <>
      {/* Main GroupFinder View */}
      {!selectedActivity ? (
        <div className="min-h-screen bg-black text-white p-4">
          <div className="flex items-center">
            <button onClick={handleGoBack} className="btn text-lg bg-gray-500 border-none text-white">
              X
            </button>
            <h1 className="flex-1 text-center font-bold text-2xl">Find A Group!</h1>
            <div className="w-12" />
          </div>{' '}
          <h2 className="mt-8 font-bold text-xl">Filter By Body Part</h2>
          {/* Filter UI */}
          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
              {allBodyparts.map(part => {
                const selected = selectedBodyparts.includes(part);
                return (
                  <button
                    key={part}
                    onClick={() => (selected ? handleRemove(part) : handleSelect(part))}
                    className={`flex items-center px-3 py-1 rounded-full border transition-colors whitespace-nowrap flex-shrink-0
                      ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-700 text-gray-200 border-gray-500 hover:bg-blue-800'
                      }`}
                  >
                    <span>{capitalizeWords(part)}</span>
                    {selected && <span className="ml-2 font-bold text-white">x</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-10 flex">
            <h2 className="font-bold text-xl">Matching Activities</h2>
          </div>
          {/* Loading state */}
          {loading && (
            <div className="mt-4 text-center">
              <p>Loading activities...</p>
            </div>
          )}
          {/* Error state */}
          {error && (
            <div className="mt-4 text-center text-red-500">
              <p>Error: {error}</p>
            </div>
          )}
          {/* No activities */}
          {!loading && !error && filteredActivities.length === 0 && (
            <div className="mt-4 text-center text-gray-400">
              <p>No activities found matching your criteria.</p>
            </div>
          )}
          {/* Activities list */}
          {!loading && !error && filteredActivities.length > 0 && (
            <div className="mt-4 space-y-4">
              {filteredActivities.map(activity => {
                const isOwnActivity = activity.userId === getCookie('userId');

                return (
                  <div
                    key={activity._id}
                    className="p-3 border border-gray-500 rounded-2xl max-w-md mx-auto flex flex-col overflow-hidden"
                  >
                    <div className="flex items-center">
                      <img
                        src="https://cdn-icons-png.freepik.com/512/6833/6833605.png"
                        className="h-20 w-20 rounded-full"
                      />
                      <div className="flex flex-col ml-2">
                        <p>
                          <span className="font-bold">Name: </span>
                          {activity.name}
                        </p>
                        <p>
                          <span className="font-bold">Gym: </span>
                          {activity.gym || 'Not specified'}
                        </p>
                        <p>
                          <span className="font-bold">Time: </span>
                          {activity.time || 'Not specified'}
                        </p>
                        {isOwnActivity && <p className="text-blue-400 text-sm italic">Your activity</p>}
                      </div>
                    </div>

                    {/* Attendees */}
                    {activity.attendess && activity.attendess.length > 0 && (
                      <div className="attendees flex mt-2">
                        {activity.attendess.slice(0, 3).map((attendee, index) => (
                          <img
                            key={index}
                            src={`https://static.vecteezy.com/system/resources/previews/024/183/525/non_2x/avatar-of-a-man-portrait-of-a-young-guy-illustration-of-male-character-in-modern-color-style-vector.jpg`}
                            className={`h-8 w-8 rounded-full ${index > 0 ? 'ml-2' : ''}`}
                            alt={`Attendee ${index + 1}`}
                          />
                        ))}
                        {activity.attendess.length > 3 && (
                          <div className="ml-2 h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                            +{activity.attendess.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attendee limit info */}
                    {activity.attendeessLimit && (
                      <p className="mt-2 text-sm text-gray-400">
                        Spots: {activity.attendess?.length || 0}/{activity.attendeessLimit}
                      </p>
                    )}

                    {/* Description */}
                    {activity.description && (
                      <p className="mt-4 max-h-16 overflow-hidden break-words">
                        {activity.description.length > 90
                          ? activity.description.slice(0, 90) + '...'
                          : activity.description}
                      </p>
                    )}

                    <div className="flex justify-center mt-5">
                      <button onClick={() => handleActivityClick(activity)} className="btn bg-green-600 h-8 mr-2">
                        More Details
                      </button>
                      {activity.showWorkoutPlan && activity.workoutPlanId && (
                        <button className="btn bg-gray-500 h-8">See Workout Plan</button>
                      )}
                      {isOwnActivity ? (
                        <button className="btn bg-blue-600 ml-5 h-8">Manage</button>
                      ) : (
                        <button className="btn bg-gray-500 ml-5 h-8">Ask to Join</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full-Screen Activity Details Modal */
        <div className="fixed inset-0 bg-black text-white z-50 overflow-y-auto">
          <div className="min-h-screen p-4">
            {/* Header with close button */}
            <div className="flex items-center mb-6">
              <button onClick={handleCloseDetails} className="btn text-lg bg-gray-500 border-none text-white">
                ✕
              </button>
              <h1 className="flex-1 text-center font-bold text-2xl">Activity Details</h1>
              <div className="w-12" />
            </div>

            {/* Activity Details */}
            <div className="max-w-2xl mx-auto">
              {/* Main Info */}
              <div className="bg-gray-900 rounded-2xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://cdn-icons-png.freepik.com/512/6833605.png"
                    className="h-24 w-24 rounded-full mr-4"
                  />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedActivity.name}</h2>
                    <p className="text-gray-300">
                      <span className="font-semibold">Gym: </span>
                      {selectedActivity.gym || 'Not specified'}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Time: </span>
                      {selectedActivity.time || 'Not specified'}
                    </p>
                    {selectedActivity.userId === getCookie('userId') && (
                      <p className="text-blue-400 text-sm italic mt-1">Your activity</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedActivity.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedActivity.description}</p>
                  </div>
                )}

                {/* Attendee Info */}
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Attendees</h3>
                  <p className="text-gray-300 mb-3">
                    {selectedActivity.attendess?.length || 0} / {selectedActivity.attendeessLimit || 'No limit'} people
                  </p>

                  {selectedActivity.attendess && selectedActivity.attendess.length > 0 && (
                    <div className="space-y-2">
                      {selectedActivity.attendess.map((attendee, index) => (
                        <div key={index} className="flex items-center">
                          <img
                            src="https://static.vecteezy.com/system/resources/previews/024/183/525/non_2x/avatar-of-a-man-portrait-of-a-young-guy-illustration-of-male-character-in-modern-color-style-vector.jpg"
                            className="h-10 w-10 rounded-full mr-3"
                            alt={`Attendee ${index + 1}`}
                          />
                          <div>
                            <p className="font-medium">User {index + 1}</p>
                            <p className="text-sm text-gray-400 capitalize">{attendee.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Body Parts */}
                {selectedActivity.bodyParts && selectedActivity.bodyParts.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Target Body Parts</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedActivity.bodyParts.map((bodyPartObj, index) => (
                        <div key={index}>
                          {Object.entries(bodyPartObj).map(
                            ([part, value]) =>
                              value &&
                              value.trim() !== '' && (
                                <span
                                  key={part}
                                  className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm mr-2 mb-2"
                                >
                                  {capitalizeWords(part)}
                                </span>
                              )
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {selectedActivity.showWorkoutPlan && selectedActivity.workoutPlanId && (
                    <button className="btn bg-gray-600 text-white px-6 py-2">View Workout Plan</button>
                  )}
                  {selectedActivity.userId === getCookie('userId') ? (
                    <button className="btn bg-blue-600 text-white px-6 py-2">Manage Activity</button>
                  ) : (
                    <button className="btn bg-green-600 text-white px-6 py-2">Ask to Join</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupFinder;
