import { useNavigate } from 'react-router';
import { useAuth } from '../context';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const currentPath = window.location.pathname;

  const goToProfile = () => {
    isAuthenticated ? navigate('/profile') : navigate('/signin');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2e3a50] border-t border-gray-700 pb-safe">
      <div className="px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {/* Home */}
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-xl"
          >
            <img
              src={currentPath === '/' ? '/HomeON.png' : '/HomeOFF.png'}
              alt="Home"
              className="w-6 h-6 mb-1"
            />
            <span className={`text-xs ${currentPath === '/' ? 'text-white' : 'text-gray-400'}`}>Home</span>
          </button>

          {/* Plans */}
          <button
            onClick={() => navigate('/plans')}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-xl"
          >
            <img
              src={currentPath.startsWith('/plans') ? '/PlansON.png' : '/PlansOFF.png'}
              alt="Plans"
              className="w-6 h-6 mb-1"
            />
            <span className={`text-xs ${currentPath.startsWith('/plans') ? 'text-white' : 'text-gray-400'}`}>
              Plans
            </span>
          </button>

          {/* Groups */}
          <button
            onClick={() => navigate('/groupfinder')}
            className="flex flex-col items-center justify-center py-2 px-3 rounded-xl"
          >
            <img
              src={currentPath.startsWith('/groupfinder') ? '/GroupON.png' : '/GroupOFF.png'}
              alt="Groups"
              className="w-8 h-8 -mb-1 object-contain"
            />
            <span className={`text-xs ${currentPath.startsWith('/groupfinder') ? 'text-white' : 'text-gray-400'}`}>
              Groups
            </span>
          </button>

          {/* Profile */}
          <button onClick={goToProfile} className="flex flex-col items-center justify-center py-2 px-3 rounded-xl">
            <img
              src={currentPath.startsWith('/profile') ? '/ProfileON.png' : '/ProfileOFF.png'}
              alt="Profile"
              className="w-6 h-6 mb-1"
            />
            <span className={`text-xs ${currentPath.startsWith('/profile') ? 'text-white' : 'text-gray-400'}`}>
              Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
