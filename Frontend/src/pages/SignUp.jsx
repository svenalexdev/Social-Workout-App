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
    <div className="min-h-screen bg-black text-white p-4">
      {step === 1 ? (
        <>
          <h2 className="mt-10 text-center text-3xl font-bold text-white mb-10"> Sign Up</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300">User Name</label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={handleChange}
                  required
                  className="block w-full bg-gray-900 rounded-lg p-2 text-gray-300 border border-gray-600 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  value={email}
                  required
                  className="block w-full bg-gray-900 rounded-lg p-2 text-gray-300 border border-gray-600 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  value={password}
                  required
                  className="block w-full bg-gray-900 rounded-lg p-2 text-gray-300 border border-gray-600 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg bg-indigo-600 p-3 mt-9 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign Up
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <h2 className="mt-10 text-center text-3xl font-bold text-white mb-10"> Complete Your Profile</h2>
          <form className="space-y-4" onSubmit={handleSubmitProfile}>
            <div>
              <label className="block text-sm text-gray-300">Height</label>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                required
                className="w-full bg-gray-900 p-2 rounded-lg text-gray-300 border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Weight</label>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                required
                className="w-full bg-gray-900 p-2 rounded-lg text-gray-300 border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                required
                className="w-full bg-gray-900 p-2 rounded-lg text-gray-300 border border-gray-600"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 p-3 rounded-lg mt-6" disabled={loading}>
              Submit Profile
            </button>
          </form>
        </>
      )}
      <p className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link to="/signin" className="text-primary hover:underline">
          Log in!
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
