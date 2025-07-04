import { useNavigate } from 'react-router';

function Home() {
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
  return (
    <div>
      Home
      <div className="flex flex-col justify-center">
        <button className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700" onClick={GoToPlan}>
          GO TO PLAN
        </button>
        <button className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700" onClick={GoToSignUp}>
          GO TO SIGN UP
        </button>
        <button className="bg-[#3b82f6] text-white px-3 py-1 text-sm rounded hover:bg-blue-700" onClick={GoToSignIn}>
          GO TO SIGN IN
        </button>
      </div>
    </div>
  );
}

export default Home;
