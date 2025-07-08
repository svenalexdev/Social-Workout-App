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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-[50px] bg-red-300 w-full text-center pt-3 text-black flex justify-around">
      <button onClick={goToPlans}>Plans</button>
      <button onClick={goToProfile}>Profile</button>
    </div>
  );
}

export default Navbar;
