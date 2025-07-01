import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { toast } from 'react-toastify';
import { signin } from '../data/auth.js';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [{ email, password }, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    try {
      e.preventDefault();
      if (!email || !password) throw new Error('All fields are required');
      setLoading(true);

      const { message } = await signin({ email, password });
      toast.success(message || 'Welcome Back');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h2 className="mt-10 text-center text-3xl font-bold text-white mb-10"> {isLogin ? 'Sign in' : 'Sign up'}</h2>
      <form className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-300">User Name</label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full bg-gray-900 rounded-lg p-2 text-gray-300 border border-gray-600 backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300">Email address</label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
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
              required
              autoComplete="current-password"
              className="block w-full bg-gray-900 rounded-lg p-2 text-gray-300 border border-gray-600 backdrop-blur-sm"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-indigo-600 p-3 mt-9 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isLogin ? 'Sign in' : 'Sign up'}
          </button>
        </div>

        <p className="mt-4 text-center text-sm">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button type="button" className="text-indigo-600 hover:underline" onClick={() => setIsLogin(false)}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="text-indigo-600 hover:underline" onClick={() => setIsLogin(true)}>
                Sign in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default LoginSignup;
