import { useNavigate } from 'react-router';
import { useAuth } from '../context/index.js';

function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  const handleSignOut = async () => {
    await logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <div className=" bg-black text-white p-4">
      <div className="flex flex-col items-center justify-center min-h-[93vh]">
        <h1 className="text-4xl font-bold mb-8">Workout Tracker</h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            className="bg-[#3b82f6] text-white px-6 py-3 text-lg rounded-lg hover:bg-blue-700 transition-colors"
            onClick={GoToPlan}
          >
            My Plans
          </button>
          <button
            className="bg-green-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-green-700 transition-colors"
            onClick={GoToGroupFinder}
          >
            Find Groups
          </button>
          <button
            className="bg-purple-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-purple-700 transition-colors"
            onClick={GoToSignUp}
          >
            Sign Up
          </button>
          <button
            className="bg-gray-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-gray-700 transition-colors"
            onClick={GoToSignIn}
          >
            Sign In
          </button>
          {/* <button
            className="bg-red-600 text-white px-6 py-3 text-lg rounded-lg hover:bg-red-700 transition-colors mt-4"
            onClick={handleSignOut}
          >
            Sign Out
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default Home;
