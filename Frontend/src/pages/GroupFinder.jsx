import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCookie } from '../utils/cookieUtils';
import BodypartFilter from '../components/BodypartFilter';

const GroupFinder = () => {
  const navigate = useNavigate();

  // State management
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBodyparts, setSelectedBodyparts] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [managingActivity, setManagingActivity] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    gym: '',
    time: '',
    attendeessLimit: 5
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [userImages, setUserImages] = useState({}); // Cache for user images

  // Default fallback image
  const defaultImage =
    'https://static.vecteezy.com/system/resources/previews/024/183/525/non_2x/avatar-of-a-man-portrait-of-a-young-guy-illustration-of-male-character-in-modern-color-style-vector.jpg';

  // Function to fetch user data and cache the image
  const fetchUserImage = async userId => {
    if (!userId) return defaultImage;

    // Return cached image if available
    if (userImages[userId]) {
      return userImages[userId];
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${BACKEND_URL}/users/${userId}`, {
        withCredentials: true
      });

      const imageUrl = response.data.image || defaultImage;

      // Cache the image
      setUserImages(prev => ({
        ...prev,
        [userId]: imageUrl
      }));

      return imageUrl;
    } catch (error) {
      console.error('Failed to fetch user image:', error);
      // Cache the default image to avoid repeated failed requests
      setUserImages(prev => ({
        ...prev,
        [userId]: defaultImage
      }));
      return defaultImage;
    }
  };

  // UserAvatar component
  const UserAvatar = ({ userId, name, status, className, size = 'h-8 w-8' }) => {
    const [imageSrc, setImageSrc] = useState(defaultImage);

    useEffect(() => {
      const loadImage = async () => {
        const extractedUserId = typeof userId === 'object' ? userId._id : userId;
        const image = await fetchUserImage(extractedUserId);
        setImageSrc(image);
      };

      loadImage();
    }, [userId]);

    const getAttendeeStyle = status => {
      switch (status) {
        case 'approved':
          return 'opacity-100';
        case 'pending':
          return 'opacity-50';
        default:
          return 'opacity-100';
      }
    };

    return (
      <img
        src={imageSrc}
        className={`${size} rounded-full ${className} ${getAttendeeStyle(status)} transition-all duration-300`}
        alt={`${name || 'User'}${status ? ` - ${status}` : ''}`}
        title={`${name || 'User'}${status ? ` - Status: ${status}` : ''}`}
        onError={() => setImageSrc(defaultImage)}
      />
    );
  };

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

  // Handle opening manage mode
  const handleManageActivity = activity => {
    setManagingActivity(activity);
    setEditForm({
      name: activity.name || '',
      description: activity.description || '',
      gym: activity.gym || '',
      time: activity.time || '',
      attendeessLimit: activity.attendeessLimit || 5
    });
  };

  // Handle closing manage mode
  const handleCloseManage = () => {
    setManagingActivity(null);
    setEditForm({
      name: '',
      description: '',
      gym: '',
      time: '',
      attendeessLimit: 5
    });
  };

  // Handle form field changes
  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle updating activity
  const handleUpdateActivity = async () => {
    if (!managingActivity || !editForm.name || !editForm.description || !editForm.gym) {
      alert('Please fill in all required fields (Name, Description, and Gym)');
      return;
    }

    try {
      setIsUpdating(true);
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const updateData = {
        name: editForm.name,
        description: editForm.description,
        gym: editForm.gym,
        time: editForm.time,
        showWorkoutPlan: managingActivity.showWorkoutPlan || true,
        workoutPlanId: managingActivity.workoutPlanId,
        attendeessLimit: parseInt(editForm.attendeessLimit),
        attendess: managingActivity.attendess || [],
        bodyParts: managingActivity.bodyParts || []
      };

      const response = await fetch(`${BACKEND_URL}/lfg/${managingActivity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update activity');
      }

      const updatedActivity = await response.json();
      console.log('Activity updated successfully:', updatedActivity);

      // Update the activities list
      setActivities(prev => prev.map(activity => (activity._id === managingActivity._id ? updatedActivity : activity)));

      alert('✅ Activity updated successfully!');
      handleCloseManage();
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('❌ Failed to update activity: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting activity
  const handleDeleteActivity = async () => {
    if (!managingActivity) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete the activity "${managingActivity.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setIsUpdating(true);
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${BACKEND_URL}/lfg/${managingActivity._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete activity');
      }

      console.log('Activity deleted successfully');

      // Remove the activity from the activities list
      setActivities(prev => prev.filter(activity => activity._id !== managingActivity._id));

      alert('✅ Activity deleted successfully!');
      handleCloseManage();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('❌ Failed to delete activity: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle joining an activity
  const handleJoinActivity = async activity => {
    try {
      setIsJoining(true);
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${BACKEND_URL}/lfg/${activity._id}/join`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join activity');
      }

      const result = await response.json();
      console.log('Join request sent:', result);

      // Update the activities list with the updated activity
      setActivities(prev => prev.map(act => (act._id === activity._id ? result.activity : act)));

      // Update selected activity if it's currently displayed
      if (selectedActivity && selectedActivity._id === activity._id) {
        setSelectedActivity(result.activity);
      }

      alert('✅ Join request sent successfully! The activity owner will review your request.');
    } catch (error) {
      console.error('Error joining activity:', error);
      alert('❌ Failed to join activity: ' + error.message);
    } finally {
      setIsJoining(false);
    }
  };

  // Handle leaving an activity
  const handleLeaveActivity = async activity => {
    const confirmLeave = confirm(`Are you sure you want to leave "${activity.name}"?`);
    if (!confirmLeave) return;

    try {
      setIsJoining(true);
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${BACKEND_URL}/lfg/${activity._id}/leave`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave activity');
      }

      const result = await response.json();
      console.log('Left activity:', result);

      // Update the activities list with the updated activity
      setActivities(prev => prev.map(act => (act._id === activity._id ? result.activity : act)));

      // Update selected activity if it's currently displayed
      if (selectedActivity && selectedActivity._id === activity._id) {
        setSelectedActivity(result.activity);
      }

      alert('✅ Successfully left the activity.');
    } catch (error) {
      console.error('Error leaving activity:', error);
      alert('❌ Failed to leave activity: ' + error.message);
    } finally {
      setIsJoining(false);
    }
  };

  // Handle updating attendee status (approve/decline requests)
  const handleUpdateAttendeeStatus = async (activityId, attendeeId, newStatus) => {
    try {
      setIsUpdating(true);
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${BACKEND_URL}/lfg/${activityId}/attendee/${attendeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update attendee status');
      }

      const result = await response.json();
      console.log('Attendee status updated:', result);

      // Update the activities list with the updated activity
      setActivities(prev => prev.map(act => (act._id === activityId ? result.activity : act)));

      // Update managing activity if it's currently being managed
      if (managingActivity && managingActivity._id === activityId) {
        setManagingActivity(result.activity);
      }

      // Update selected activity if it's currently displayed
      if (selectedActivity && selectedActivity._id === activityId) {
        setSelectedActivity(result.activity);
      }

      const statusText = newStatus === 'approved' ? 'approved' : 'removed';
      alert(`✅ ${newStatus === 'approved' ? 'Join request approved' : 'Attendee removed'} successfully!`);
    } catch (error) {
      console.error('Error updating attendee status:', error);
      alert('❌ Failed to update attendee status: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function to get user's status in an activity
  const getUserStatusInActivity = activity => {
    const userId = getCookie('userId');
    const attendee = activity.attendess?.find(att => {
      // Handle both populated (object) and non-populated (string) userId
      const attendeeUserId = typeof att.userId === 'object' ? att.userId._id : att.userId;
      return attendeeUserId === userId;
    });
    return attendee ? attendee.status : null;
  };

  // Helper function to check if user can join activity
  const canUserJoinActivity = activity => {
    const userId = getCookie('userId');
    // Handle both populated (object) and non-populated (string) userId
    const activityUserId = typeof activity.userId === 'object' ? activity.userId._id : activity.userId;
    const isOwnActivity = activityUserId === userId;
    const userStatus = getUserStatusInActivity(activity);
    const approvedAttendeesCount = activity.attendess?.filter(att => att.status === 'approved').length || 0;
    const isAtLimit = activity.attendeessLimit && approvedAttendeesCount >= activity.attendeessLimit;

    return !isOwnActivity && !userStatus && !isAtLimit;
  };

  // Other
  //   // Predefined body parts for filtering
  //   const allBodyparts = [
  //     'back',
  //     'cardio',
  //     'chest',
  //     'lower arms',
  //     'lower legs',
  //     'neck',
  //     'shoulders',
  //     'upper arms',
  //     'upper legs',
  //     'waist'
  //   ];

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

  // Sort activities by most recent first (by creation date)
  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(a.createdAt || a._id);
    const dateB = new Date(b.createdAt || b._id);
    return dateB - dateA; // Most recent first
  });

  // Separate user's own activities from others
  const currentUserId = getCookie('userId');
  const myActivities = sortedActivities.filter(activity => {
    // Handle both populated (object) and non-populated (string) userId
    const activityUserId = typeof activity.userId === 'object' ? activity.userId._id : activity.userId;
    return activityUserId === currentUserId;
  });
  const otherActivities = sortedActivities.filter(activity => {
    // Handle both populated (object) and non-populated (string) userId
    const activityUserId = typeof activity.userId === 'object' ? activity.userId._id : activity.userId;
    return activityUserId !== currentUserId;
  });

  // Filter other activities based on selected body parts
  const filteredOtherActivities =
    selectedBodyparts.length > 0
      ? otherActivities.filter(activity => {
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
      : otherActivities;

  //   // Capitalize words and handle camelCase/compound words
  const capitalizeWords = str => {
    if (!str) return '';

    // Handle camelCase words like 'cardiovascularSystem' -> 'Cardiovascular System'
    const withSpaces = str.replace(/([a-z])([A-Z])/g, '$1 $2');

    return withSpaces.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <>
      {/* Main GroupFinder View */}
      {!selectedActivity && !managingActivity ? (
        <div className="bg-[#121212] text-white min-h-screen pt-safe pb-10 w-full max-w-md mx-auto">
          <div className="p-6">
            <div className="flex items-center">
              {/* <button onClick={handleGoBack} className="btn text-lg bg-gray-500 border-none text-white">
              X
            </button> */}
              <h1 className="flex-1 font-bold text-2xl mb-3">Find A Group!</h1>
              <div className="w-12" />
            </div>{' '}
            {/* My Posted Activities Section - Only show if user has posted activities */}
            {myActivities.length > 0 && (
              <>
                <div className="mt-10 flex">
                  <h2 className="font-bold text-xl">My Posted Activities</h2>
                </div>
                <div className="mt-4 space-y-4">
                  {myActivities.map(activity => (
                    <div
                      key={activity._id}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <UserAvatar
                          userId={activity.userId}
                          name={activity.userId?.name}
                          className=""
                          size="h-20 w-20"
                        />
                        <div className="flex flex-col ml-2">
                          <p>
                            <span className="font-bold">Name: </span>
                            {activity.name}
                          </p>
                          <p>
                            <span className="font-bold">Created by: </span>
                            {activity.userId?.name || 'You'}
                          </p>
                          <p>
                            <span className="font-bold">Gym: </span>
                            {activity.gym || 'Not specified'}
                          </p>
                          <p>
                            <span className="font-bold">Time: </span>
                            {activity.time || 'Not specified'}
                          </p>
                          <p className="text-blue-400 text-sm italic">Your activity</p>
                        </div>
                      </div>

                      {/* Attendees */}
                      {activity.attendess && activity.attendess.length > 0 && (
                        <div className="attendees flex mt-2">
                          {activity.attendess.slice(0, 3).map((attendee, index) => {
                            return (
                              <UserAvatar
                                key={index}
                                userId={attendee.userId}
                                name={attendee.userId?.name}
                                status={attendee.status}
                                className={`${index > 0 ? 'ml-2' : ''}`}
                                size="h-8 w-8"
                              />
                            );
                          })}
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
                          Spots: {activity.attendess?.filter(att => att.status === 'approved').length || 0}/
                          {activity.attendeessLimit}
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

                      {/* Attendee Management Section - Show if there are attendees */}
                      {activity.attendess && activity.attendess.length > 0 && (
                        <div className="mt-3 border-t border-blue-400 pt-3">
                          <h4 className="text-sm font-medium text-blue-200 mb-2">
                            Manage Requests ({activity.attendess.filter(att => att.status === 'pending').length}{' '}
                            pending)
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {activity.attendess.map((attendee, index) => {
                              return (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-black bg-opacity-30 p-2 rounded"
                                >
                                  <div className="flex items-center">
                                    <UserAvatar
                                      userId={attendee.userId}
                                      name={attendee.userId?.name}
                                      status={attendee.status}
                                      className="mr-2"
                                      size="h-6 w-6"
                                    />
                                    <div>
                                      <p className="text-xs font-medium text-white">
                                        {attendee.userId?.name || 'Unknown User'}
                                      </p>
                                      <p
                                        className={`text-xs capitalize font-medium ${
                                          attendee.status === 'approved'
                                            ? 'text-green-400'
                                            : attendee.status === 'pending'
                                            ? 'text-yellow-400'
                                            : 'text-gray-400'
                                        }`}
                                      >
                                        {attendee.status}
                                        {attendee.status === 'pending' && ' ⏳'}
                                        {attendee.status === 'approved' && ' ✅'}
                                      </p>
                                    </div>
                                  </div>

                                  {attendee.status === 'pending' && (
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const attendeeUserId =
                                            typeof attendee.userId === 'object' ? attendee.userId._id : attendee.userId;
                                          handleUpdateAttendeeStatus(activity._id, attendeeUserId, 'approved');
                                        }}
                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                                        disabled={isUpdating}
                                      >
                                        ✓
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const attendeeUserId =
                                            typeof attendee.userId === 'object' ? attendee.userId._id : attendee.userId;
                                          handleUpdateAttendeeStatus(activity._id, attendeeUserId, 'declined');
                                        }}
                                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                                        disabled={isUpdating}
                                      >
                                        ✗
                                      </button>
                                    </div>
                                  )}

                                  {attendee.status === 'approved' && (
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const attendeeUserId =
                                            typeof attendee.userId === 'object' ? attendee.userId._id : attendee.userId;
                                          handleUpdateAttendeeStatus(activity._id, attendeeUserId, 'declined');
                                        }}
                                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                                        disabled={isUpdating}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center mt-5">
                        <button
                          onClick={() => handleActivityClick(activity)}
                          className="flex-1 bg-[#F2AB40] hover:bg-[#e09b2d] text-black px-3 py-2 rounded-full text-sm font-medium transition-colors mr-2"
                        >
                          More Details
                        </button>
                        <button onClick={() => handleManageActivity(activity)} className="btn bg-blue-600 h-8 relative">
                          Manage
                          {activity.attendess?.some(att => att.status === 'pending') && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                              {activity.attendess.filter(att => att.status === 'pending').length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* Filter UI */}
            <BodypartFilter
              selectedBodyparts={selectedBodyparts}
              onSelect={handleSelect}
              onRemove={handleRemove}
              className="mt-16"
            />
            <div className="mt-6 flex">
              <h2 className="font-bold text-2xl">Matching Activities</h2>
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
            {!loading && !error && filteredOtherActivities.length === 0 && (
              <div className="mt-4 text-center text-gray-400">
                <p>No activities found matching your criteria.</p>
              </div>
            )}
            {/* Activities list */}
            {!loading && !error && filteredOtherActivities.length > 0 && (
              <div className="mt-4 space-y-4">
                {filteredOtherActivities.map(activity => {
                  return (
                    <div
                      key={activity._id}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600 hover:border-[#F2AB40] transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <UserAvatar
                          userId={activity.userId}
                          name={activity.userId?.name}
                          className=""
                          size="h-20 w-20"
                        />
                        <div className="flex flex-col ml-2">
                          <p>
                            <span className="font-bold">Name: </span>
                            {activity.name}
                          </p>
                          <p>
                            <span className="font-bold">Created by: </span>
                            {activity.userId?.name || 'Unknown User'}
                          </p>
                          <p>
                            <span className="font-bold">Gym: </span>
                            {activity.gym || 'Not specified'}
                          </p>
                          <p>
                            <span className="font-bold">Time: </span>
                            {activity.time || 'Not specified'}
                          </p>
                          {(() => {
                            const userStatus = getUserStatusInActivity(activity);
                            if (userStatus === 'pending') {
                              return <p className="text-yellow-400 text-sm italic">Join request pending </p>;
                            } else if (userStatus === 'approved') {
                              return <p className="text-green-400 text-sm italic">You're joining this! </p>;
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      {/* Attendees */}
                      {activity.attendess && activity.attendess.length > 0 && (
                        <div className="attendees flex mt-2">
                          {activity.attendess.slice(0, 3).map((attendee, index) => {
                            return (
                              <UserAvatar
                                key={index}
                                userId={attendee.userId}
                                name={attendee.userId?.name}
                                status={attendee.status}
                                className={`${index > 0 ? 'ml-2' : ''}`}
                                size="h-8 w-8"
                              />
                            );
                          })}
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
                          Spots: {activity.attendess?.filter(att => att.status === 'approved').length || 0}/
                          {activity.attendeessLimit}
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
                        <button
                          onClick={() => handleActivityClick(activity)}
                          className="flex-1 bg-[#F2AB40] hover:bg-[#e09b2d] text-black px-3 py-2 rounded-full text-sm font-medium transition-colors mr-2"
                        >
                          More Details
                        </button>
                        {/* {activity.showWorkoutPlan && activity.workoutPlanId && (
                        <button className="btn bg-gray-500 h-8">See Workout Plan</button>
                      )} */}
                        {(() => {
                          const userStatus = getUserStatusInActivity(activity);
                          const canJoin = canUserJoinActivity(activity);

                          if (userStatus === 'pending') {
                            return (
                              <button
                                className="flex-1 bg-yellow-600 text-white px-3 py-2 rounded-full text-sm font-medium ml-2"
                                disabled
                              >
                                Pending
                              </button>
                            );
                          } else if (userStatus === 'approved') {
                            return (
                              <button
                                onClick={() => handleLeaveActivity(activity)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors ml-2"
                                disabled={isJoining}
                              >
                                {isJoining ? 'Leaving...' : 'Leave'}
                              </button>
                            );
                          } else if (canJoin) {
                            return (
                              <button
                                onClick={() => handleJoinActivity(activity)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full text-sm font-medium transition-colors ml-2"
                                disabled={isJoining}
                              >
                                {isJoining ? 'Joining...' : 'Ask to Join'}
                              </button>
                            );
                          } else {
                            const approvedCount =
                              activity.attendess?.filter(att => att.status === 'approved').length || 0;
                            const isAtLimit = activity.attendeessLimit && approvedCount >= activity.attendeessLimit;
                            return (
                              <button
                                className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-full text-sm font-medium ml-2"
                                disabled
                              >
                                {isAtLimit ? 'Full' : 'Unavailable'}
                              </button>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : managingActivity ? (
        /* Manage Activity Modal */
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-600 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Manage Activity</h2>
              <button
                onClick={handleCloseManage}
                className="text-gray-400 hover:text-[#F2AB40] text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-300">
                <strong>Activity ID:</strong> {managingActivity._id}
              </p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Activity Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => handleEditFormChange('name', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="e.g., Chest Day Workout"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Gym/Location *</label>
                <input
                  type="text"
                  value={editForm.gym}
                  onChange={e => handleEditFormChange('gym', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="e.g., McFit Downtown"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={editForm.time}
                  onChange={e => handleEditFormChange('time', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                <textarea
                  value={editForm.description}
                  onChange={e => handleEditFormChange('description', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors h-20 resize-none"
                  placeholder="Describe the workout activity..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Max Attendees</label>
                <input
                  type="number"
                  value={editForm.attendeessLimit}
                  onChange={e => handleEditFormChange('attendeessLimit', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  min="1"
                  max="20"
                />
              </div>

              <div className="border-t border-gray-600 pt-4">
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Approved Attendees:</strong>{' '}
                  {managingActivity.attendess?.filter(att => att.status === 'approved').length || 0} /{' '}
                  {managingActivity.attendeessLimit}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Total Requests:</strong> {managingActivity.attendess?.length || 0} (including pending)
                </p>
                <p className="text-sm text-gray-300">
                  <strong>Created:</strong> {new Date(managingActivity.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Attendee Management Section */}
              {managingActivity.attendess && managingActivity.attendess.length > 0 && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Manage Join Requests</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {managingActivity.attendess.map((attendee, index) => {
                      const getAttendeeStyle = status => {
                        switch (status) {
                          case 'approved':
                            return 'opacity-100';
                          case 'pending':
                            return 'opacity-50';
                          default:
                            return 'opacity-100';
                        }
                      };

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-lg border border-gray-600"
                        >
                          <div className="flex items-center">
                            <UserAvatar
                              userId={attendee.userId}
                              name={attendee.userId?.name}
                              status={attendee.status}
                              className="mr-2"
                              size="h-8 w-8"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {attendee.userId?.name || 'Unknown User'}
                              </p>
                              <p
                                className={`text-xs capitalize font-medium ${
                                  attendee.status === 'approved'
                                    ? 'text-green-400'
                                    : attendee.status === 'pending'
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                                }`}
                              >
                                {attendee.status}
                                {attendee.status === 'pending' && ' ⏳'}
                                {attendee.status === 'approved' && ' ✅'}
                              </p>
                            </div>
                          </div>

                          {attendee.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const attendeeUserId =
                                    typeof attendee.userId === 'object' ? attendee.userId._id : attendee.userId;
                                  handleUpdateAttendeeStatus(managingActivity._id, attendeeUserId, 'approved');
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                disabled={isUpdating}
                              >
                                ✓ Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const attendeeUserId =
                                    typeof attendee.userId === 'object' ? attendee.userId._id : attendee.userId;
                                  handleUpdateAttendeeStatus(managingActivity._id, attendeeUserId, 'declined');
                                }}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                disabled={isUpdating}
                              >
                                ✗ Decline
                              </button>
                            </div>
                          )}

                          {attendee.status === 'approved' && (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const attendeeUserId =
                                    typeof attendee.userId === 'object' ? attendee.userId._id : attendee.userId;
                                  handleUpdateAttendeeStatus(managingActivity._id, attendeeUserId, 'declined');
                                }}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                disabled={isUpdating}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {managingActivity.attendess.filter(att => att.status === 'pending').length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      💡 You have {managingActivity.attendess.filter(att => att.status === 'pending').length} pending
                      join request(s)
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleDeleteActivity}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Deleting...' : 'Delete Activity'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseManage}
                  className="px-4 py-2 bg-[#1a1a1a] border border-gray-600 text-gray-300 rounded-lg hover:border-[#F2AB40] hover:text-white transition-all"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateActivity}
                  className="flex-1 px-4 py-2 bg-[#F2AB40] text-black rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Full-Screen Activity Details Modal */
        <div className="bg-[#121212] text-white min-h-screen pt-safe pb-5 w-full max-w-md mx-auto overflow-y-auto">
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-600 shadow-xl m-4">
            {/* Header with close button */}
            <div className="flex items-center mb-6">
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-[#F2AB40] text-2xl transition-colors"
              >
                ✕
              </button>
              <h1 className="flex-1 text-center font-bold text-2xl">Activity Details</h1>
              <div className="w-12" />
            </div>

            {/* Activity Details */}
            <div className="max-w-2xl mx-auto">
              {/* Main Info */}
              <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-6 border border-gray-600">
                <div className="flex items-center mb-4">
                  <UserAvatar
                    userId={selectedActivity.userId}
                    name={selectedActivity.userId?.name}
                    className="mr-4"
                    size="h-24 w-24"
                  />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedActivity.name}</h2>
                    <p className="text-gray-300">
                      <span className="font-semibold">Created by: </span>
                      {selectedActivity.userId?.name || 'Unknown User'}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Gym: </span>
                      {selectedActivity.gym || 'Not specified'}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-semibold">Time: </span>
                      {selectedActivity.time || 'Not specified'}
                    </p>
                    {(() => {
                      const activityUserId =
                        typeof selectedActivity.userId === 'object'
                          ? selectedActivity.userId._id
                          : selectedActivity.userId;
                      return activityUserId === getCookie('userId');
                    })() && <p className="text-blue-400 text-sm italic mt-1">Your activity</p>}
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
                    {selectedActivity.attendess?.filter(att => att.status === 'approved').length || 0} /{' '}
                    {selectedActivity.attendeessLimit || 'No limit'} confirmed
                  </p>
                  <p className="text-gray-300 mb-3 text-sm">
                    Total requests: {selectedActivity.attendess?.length || 0} (including pending)
                  </p>

                  {selectedActivity.attendess && selectedActivity.attendess.length > 0 && (
                    <div className="space-y-2">
                      {selectedActivity.attendess.map((attendee, index) => {
                        const attendeeUserId =
                          typeof attendee.userId === 'object' ? attendee.userId._id : attendee.userId;
                        const isCurrentUser = attendeeUserId === getCookie('userId');
                        const statusColor =
                          attendee.status === 'approved'
                            ? 'text-green-400'
                            : attendee.status === 'pending'
                            ? 'text-yellow-400'
                            : 'text-gray-400';

                        const getAttendeeStyle = status => {
                          switch (status) {
                            case 'approved':
                              return 'opacity-100';
                            case 'pending':
                              return 'opacity-50';
                            default:
                              return 'opacity-100';
                          }
                        };

                        return (
                          <div
                            key={index}
                            className={`flex items-center ${
                              isCurrentUser ? 'bg-blue-900 bg-opacity-50 p-2 rounded' : ''
                            }`}
                          >
                            <UserAvatar
                              userId={attendee.userId}
                              name={attendee.userId?.name}
                              status={attendee.status}
                              className="mr-3"
                              size="h-10 w-10"
                            />
                            <div className="flex-1">
                              <p className="font-medium">
                                {isCurrentUser ? 'You' : attendee.userId?.name || 'Unknown User'}
                              </p>
                              <p className={`text-sm capitalize font-medium ${statusColor}`}>
                                {attendee.status}
                                {attendee.status === 'pending' && ' ⏳'}
                                {attendee.status === 'approved' && ' ✅'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Visual Legend */}
                  {selectedActivity.attendess && selectedActivity.attendess.length > 0 && (
                    <div className="mt-3 text-xs text-gray-400">
                      <p className="mb-1">Avatar status indicators:</p>
                      <div className="flex gap-4">
                        <span> Approved: Normal</span>
                        <span>⏳ Pending: 50% opacity</span>
                      </div>
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
                          {Object.entries(bodyPartObj).map(([part, value]) =>
                            part !== '_id' && value && value.trim() !== '' ? (
                              <span
                                key={part}
                                className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm mr-2 mb-2"
                              >
                                {capitalizeWords(part)}
                              </span>
                            ) : null
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {/* {selectedActivity.showWorkoutPlan && selectedActivity.workoutPlanId && (
                    <button className="btn bg-gray-600 text-white px-6 py-2">View Workout Plan</button>
                  )} */}
                  {(() => {
                    const activityUserId =
                      typeof selectedActivity.userId === 'object'
                        ? selectedActivity.userId._id
                        : selectedActivity.userId;
                    return activityUserId === getCookie('userId');
                  })() ? (
                    <button
                      onClick={() => {
                        setSelectedActivity(null); // Close details view
                        handleManageActivity(selectedActivity);
                      }}
                      className="px-6 py-2 bg-[#F2AB40] text-black rounded-lg hover:bg-[#e09b2d] transition-colors font-semibold relative"
                    >
                      Manage Activity
                      {selectedActivity.attendess?.some(att => att.status === 'pending') && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {selectedActivity.attendess.filter(att => att.status === 'pending').length}
                        </span>
                      )}
                    </button>
                  ) : (
                    (() => {
                      const userStatus = getUserStatusInActivity(selectedActivity);
                      const canJoin = canUserJoinActivity(selectedActivity);

                      if (userStatus === 'pending') {
                        return (
                          <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold" disabled>
                            Request Pending
                          </button>
                        );
                      } else if (userStatus === 'approved') {
                        return (
                          <button
                            onClick={() => handleLeaveActivity(selectedActivity)}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                            disabled={isJoining}
                          >
                            {isJoining ? 'Leaving...' : 'Leave Activity'}
                          </button>
                        );
                      } else if (canJoin) {
                        return (
                          <button
                            onClick={() => handleJoinActivity(selectedActivity)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            disabled={isJoining}
                          >
                            {isJoining ? 'Joining...' : 'Ask to Join'}
                          </button>
                        );
                      } else {
                        const approvedCount =
                          selectedActivity.attendess?.filter(att => att.status === 'approved').length || 0;
                        const isAtLimit =
                          selectedActivity.attendeessLimit && approvedCount >= selectedActivity.attendeessLimit;
                        return (
                          <button className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold" disabled>
                            {isAtLimit ? 'Activity Full' : 'Unavailable'}
                          </button>
                        );
                      }
                    })()
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
