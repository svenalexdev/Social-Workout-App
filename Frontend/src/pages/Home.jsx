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
    const handleSignOut = async () => {
    await logout();         
    navigate('/'); // Redirect to home after logout
  };

  return (
    <div>
      Home
      <div>
        <button className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700" onClick={GoToPlan}>
          GO TO PLAN
        </button>
        <button className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700" onClick={GoToSignUp}>
          GO TO SIGN UP
        </button>
        <button className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700" onClick={GoToSignIn}>
          GO TO SIGN IN
        </button>
        <button className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700" onClick={handleSignOut}>
        SIGN OUT
        </button> 
      </div>
    </div>
  );
}

export default Home;
