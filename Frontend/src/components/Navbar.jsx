import { useNavigate } from 'react-router';
import { useAuth } from '../context';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const goToProfile = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/signin');
    }
  };

  const goToPlans = () => {
    navigate('/plans');
  };

  const goToGroupFinder = () => {
    navigate('/groupfinder');
  };

  const goToHome = () => {
    navigate('/');
  };

  const currentPath = window.location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={goToHome}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl ${
            currentPath === '/' ? 'bg-[#F2AB40] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="text-xl mb-1">🏠</div>
          <span className="text-xs">Home</span>
        </button>

        <button
          onClick={goToPlans}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl ${
            currentPath.startsWith('/plans') ? 'bg-[#F2AB40] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="text-xl mb-1">📋</div>
          <span className="text-xs">Plans</span>
        </button>

        <button
          onClick={goToGroupFinder}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl ${
            currentPath.startsWith('/groupfinder') ? 'bg-[#F2AB40] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="text-xl mb-1">👥</div>
          <span className="text-xs">Groups</span>
        </button>

        <button
          onClick={goToProfile}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl ${
            currentPath.startsWith('/profile') ? 'bg-[#F2AB40] text-black' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="text-xl mb-1">👤</div>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}

export default Navbar;
