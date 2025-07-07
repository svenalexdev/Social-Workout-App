import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import { Outlet } from 'react-router';
import {AuthContextProvider} from '../context/index.js';

function MainLayout() {
  return (
     <AuthContextProvider>
    <div className="bg-slate-600 text-gray-300 flex flex-col min-h-screen">
      <main className="grow flex flex-col justify-between">
        <Outlet />
        <ToastContainer
          position="top-center"
          autoClose={1500}
          toastClassName="w-[80vw] sm:w-[250px] h-[40px] !bg-gray-800 text-white rounded-lg shadow-lg flex items-center px-4"
        />
      </main>
      <Navbar />
    </div>
     </AuthContextProvider>
  );
}

export default MainLayout;
