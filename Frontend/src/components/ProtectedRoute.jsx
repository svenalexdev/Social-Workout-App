import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/index.js';
const ProtectedLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to='/signin' state={{ next: location.pathname }} />;
   //   if (isAuthenticated) return <Outlet />;
  //   return <Navigate to='/login' />;
};

export default ProtectedLayout;