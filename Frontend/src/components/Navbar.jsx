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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-[70px] bg-red-300 w-full text-center  text-black flex justify-around">
      <button onClick={goToHome}>Home</button>
      <button onClick={goToPlans}>Plans</button>
      <button onClick={goToGroupFinder}>Groups</button>
      <button onClick={goToProfile}>Profile</button>
    </div>
  );
}

export default Navbar;
