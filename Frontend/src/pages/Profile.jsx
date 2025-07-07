import { useState, useEffect } from 'react';

const Profile = () => {
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   const fetchRecentWorkouts = async () => {
  //     try {
  //       setIsLoading(true);
  //       const BACKEND_URL = import.meta.env.VITE_API_URL;
  //       const response = await fetch(`${BACKEND_URL}/recent-workouts`);
  //       const res = await fetch(`${BACKEND_URL}/workouts?userId=${userId}&limit=4`);
  //       if (!res.ok) {
  //         throw new Error('Failed to fetch recent workouts');
  //       }
  //       const data = await res.json();
  //       setRecentWorkouts(data);
  //     } catch (error) {
  //       console.error('Error fetching recent workouts:', error.message);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchRecentWorkouts();
  // }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]  text-white">
      <div className="flex-1 flex flex-col gap-17 p-2 w-full">
        <div className="flex flex-col items-center">
          <div className="w-35 h-35 bg-[#575757] rounded-full">{/* <img src="" alt="" /> */}</div>
          <h2 className="text-2xl font-bold">Kostas</h2>
        </div>

        {/* <div className="bg-[#575757] p-4 rounded-lg shadow text-center text-2xl font-bold">My Goals</div>

        <div className="bg-[#575757] p-6 rounded-lg shadow w-full text-center text-2xl font-bold">Personal Records</div> */}

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
                  <p>{workout.muscleGroup || 'Muscle Group'}</p>
                  <p>{workout.exercise || 'Exercise'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* <div className="bg-[#575757] p-2 rounded-lg text-center shadow text-sm font-medium w-full">
          <p className="font-semibold">Best Streak</p>
          <p>10 days</p>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
