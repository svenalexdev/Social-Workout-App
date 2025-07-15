import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { signup } from '../data/auth';
import { useAuth } from '../context/index.js';

const SignUp = () => {
  const { isAuthenticated, setCheckSession, setIsAuthenticated } = useAuth();
  const [{ name, email, password }, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  //This is for the second page
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!name || !email || !password) throw new Error('All fields are required');

    if (password.length < 8) {
      toast.error('Password is too short');
      return;
    }
    setStep(2);
  };

  const handleSubmitProfile = async e => {
    e.preventDefault();
    try {
      if (!height || !weight || !age) throw new Error('All fields are required');

      setLoading(true);

      const { message } = await signup({
        name,
        email,
        password,
        stats: [{ height: parseInt(height), weight: parseInt(weight), age: parseInt(age) }]
      });

      toast.success(message || 'Account created successfully! Please log in.');
      navigate('/');

      setCheckSession(true);
    } catch (error) {
      toast.error(error.message || 'SignUp Faild');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/" />;
  return (
    <div className="bg-[#121212] text-white min-h-screen pt-safe pb-5 w-full max-w-md mx-auto">
      <div className="p-6">
        {step === 1 ? (
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-600 shadow-xl">
            <h2 className="text-center text-3xl font-bold text-white mb-8">Sign Up</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={handleChange}
                  required
                  className="block w-full bg-[#1a1a1a] rounded-lg p-3 text-white border border-gray-600 placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  value={email}
                  required
                  className="block w-full bg-[#1a1a1a] rounded-lg p-3 text-white border border-gray-600 placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  value={password}
                  required
                  className="block w-full bg-[#1a1a1a] rounded-lg p-3 text-white border border-gray-600 placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="Enter your password (min 8 characters)"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-lg bg-[#F2AB40] text-black p-3 text-sm font-semibold shadow-lg hover:bg-[#e09b2d] transition-colors"
                >
                  Next Page
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-600 shadow-xl">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-600 hover:bg-[#F2AB40] hover:text-black border border-gray-600 hover:border-[#F2AB40] px-4 py-2 rounded-lg transition-colors text-sm mb-6 text-white font-medium"
            >
              ← Back
            </button>

            <h2 className="text-center text-3xl font-bold text-white mb-8">Complete Profile</h2>

            <form className="space-y-6" onSubmit={handleSubmitProfile}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] p-3 rounded-lg text-white border border-gray-600 placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="Enter your height"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] p-3 rounded-lg text-white border border-gray-600 placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="Enter your weight"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] p-3 rounded-lg text-white border border-gray-600 placeholder-gray-500 focus:border-[#F2AB40] focus:outline-none transition-colors"
                  placeholder="Enter your age"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#F2AB40] text-black hover:bg-[#e09b2d] p-3 rounded-lg font-semibold shadow-lg transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Submit Profile'}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#F2AB40] hover:text-[#e09b2d] font-medium transition-colors">
            Log in!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
