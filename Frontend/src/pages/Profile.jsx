import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-white">
      <div className="flex-1 flex flex-col gap-17 p-2 w-full">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-[#575757] rounded-full overflow-hidden flex items-center justify-center text-4xl font-bold">
            {user?.image ? (
              <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.[0] || '?'}</span>
            )}
          </div>
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
