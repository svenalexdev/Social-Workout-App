import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { toast } from 'react-toastify';
import { signup } from '../data/auth';

const SignUp = () => {
  const [{ name, email, password }, setForm] = useState({
    name,
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    try {
      e.preventDefault();
      if (!name|| !email || !password)
        throw new Error('All fields are required');
      if (password !== confirmPassword) throw new Error('Passwords do not match');
      setLoading(true);
     
      const { message } = await signup({ name, email, password });
      console.log(message);
      toast.success = message || 'Welcome';
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h2 className="mt-10 text-center text-3xl font-bold text-white mb-10"> Sign Up</h2>
      <form className="space-y-4" onChange={handleSubmit}>
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

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary hover:underline">
            Log in!
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
