import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/index.js';

const SignOut = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await logout();
        // Redirect to home page after logout
        navigate('/');
      } catch (error) {
        console.error('Error signing out:', error);
        // Still redirect even if there's an error
        navigate('/');
      }
    };

    if (isAuthenticated) {
      handleSignOut();
    } else {
      // If already signed out, redirect to home
      navigate('/');
    }
  }, [logout, navigate, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-2xl p-8 mx-auto mt-12 max-w-md shadow-2xl border border-gray-700 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#F2AB40] to-[#e09b2d] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Signing Out...</h2>
          <p className="text-gray-400 mb-6">Please wait while we sign you out.</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2AB40]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignOut;
