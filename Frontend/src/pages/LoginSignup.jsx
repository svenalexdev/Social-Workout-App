import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { signin } from '../data/auth.js';
import { useAuth } from '../context/index,js';

const LoginSignup = () => {
  const { isAuthenticated, setCheckSession, setIsAuthenticated } = useAuth();
  const [{ email, password }, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const navigate = useNavigate();

  const handleSubmit = async e => {
    try {
      e.preventDefault();
      if (!email || !password) throw new Error('All fields are required');
      setLoading(true);
      const { userId, message } = await signin({ email, password });

      toast.success(message || 'Welcome Back');
      //alert('welcome Back');

     
      setIsAuthenticated(true);
      setCheckSession(true);
      
       //Save id in local storage
      localStorage.setItem('userId', userId);
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h2 className="mt-10 text-center text-3xl font-bold text-white mb-10"> Sign in</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
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
            Sign in
          </button>
        </div>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up!
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginSignup;
