import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRef } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfileAndWorkouts = async () => {
      setIsLoading(true);
      try {
        const BACKEND_URL = import.meta.env.VITE_API_URL;

        const userRes = await fetch(`${BACKEND_URL}/auth/me`, { credentials: 'include' });
        if (!userRes.ok) throw new Error('Failed to fetch user info');
        const userData = await userRes.json();

        if (userData.image && !userData.image.startsWith('http')) {
          userData.image = `${BACKEND_URL}${userData.image}`;
          console.log(userData);
        }
        setUser(userData);

        const userId = userData._id;
        const workoutsRes = await fetch(`${BACKEND_URL}/logs/users/${userId}&limit=4`, {
          credentials: 'include'
        });
        if (!workoutsRes.ok) throw new Error('Failed to fetch recent workouts');
        const workoutsData = await workoutsRes.json();
        setRecentWorkouts(workoutsData);
      } catch (error) {
        console.error('Error fetching profile or workouts:', error.message);
        setRecentWorkouts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndWorkouts();
  }, []);

  const handleLogout = async () => {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL;
      await fetch(`${BACKEND_URL}/auth/signout`, {
        method: 'DELETE',
        credentials: 'include'
      });
      toast.success('Successfully logged out!');
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (error) {
      console.error('Logout failed:', error.message);
      toast.error('Logout failed. Please try again.');
    }
  };
  const handleImageUpload = async e => {
    const BACKEND_URL = import.meta.env.VITE_API_URL;
    const file = e.target.files[0];

    if (!file) {
      console.error('No file selected');
      return;
    }

    console.log('Uploading file:', file.name, 'Size:', file.size);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${BACKEND_URL}/users/${user._id}/image`, {
        method: 'PUT',
        body: formData
      });

      if (res.ok) {
        const updatedUser = await res.json();
        console.log('Upload successful, updated user:', updatedUser);
        setUser(updatedUser); // Update state with new profile image
      } else {
        const errorData = await res.json();
        console.error('Upload failed:', res.status, errorData);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  const fileInputRef = useRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <div className="flex-1 flex flex-col gap-17 p-2 w-full">
        <div className="flex flex-col items-center">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-[#575757] cursor-pointer"
            onClick={handleImageClick}
          >
            {user?.image ? (
              <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-white">{user?.name?.[0] || '?'}</span>
            )}

            {/* Camera icon bottom-right */}
            <div className="absolute bottom-1 right-1 bg-[#F2AB40] rounded-full p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7h2l2-3h6l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z"
                />
                <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth={2} />
              </svg>
            </div>
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          <h2 className="text-2xl font-bold mt-2">{user?.name || 'User'}</h2>
          <p className="text-gray-400">{user?.email}</p>
        </div>

        <div>
          <h3 className="text-center text-2xl font-bold mb-2">Recent Workouts</h3>
          <div className="grid grid-cols-2 gap-4 w-full">
            {isLoading ? (
              <div className="col-span-2 text-center text-gray-400">Loading...</div>
            ) : recentWorkouts.length === 0 ? (
              <div className="col-span-2 text-center text-gray-400">No recent workouts</div>
            ) : (
              recentWorkouts.map((workout, idx) => (
                <div
                  key={workout._id || idx}
                  className="bg-[#575757] p-4 rounded-lg shadow text-center text-sm font-medium"
                >
                  <p className="font-bold text-white">{workout.planName || 'Workout'}</p>

                  {workout.exercises?.length > 0 ? (
                    <>
                      <p>{workout.exercises[0].name}</p>
                      <p className="text-xs text-gray-300">{workout.exercises[0].target}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">No exercises found</p>
                  )}

                  <p className="text-xs text-gray-400 mt-1">{new Date(workout.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center mb-15">
        <button
          onClick={handleLogout}
          className="bg-[#F2AB40] hover:bg-[#e09b2d] text-base font-semibold text-white py-2 px-6 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
