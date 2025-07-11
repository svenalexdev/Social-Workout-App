import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { signin } from '../data/auth.js';
import { setCookie } from '../utils/cookieUtils.js';
import { useAuth } from '../context/index.js';

const LoginSignup = () => {
  const location = useLocation();
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
      setCookie('userId', userId);

      navigate('/plans');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  if (isAuthenticated) return <Navigate to={location.state?.next || '/'} />;

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-2xl p-8 mx-auto mt-12 max-w-md shadow-2xl border border-gray-700 backdrop-blur-sm">
        <h2 className="text-center text-3xl font-bold text-white mb-8">Sign in</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-[#F2AB40] text-black p-3 text-sm font-semibold shadow-lg hover:bg-[#e09b2d] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F2AB40] hover:text-[#e09b2d] font-medium transition-colors">
              Sign up!
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginSignup;
