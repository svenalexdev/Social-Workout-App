import Navbar from '../components/Navbar';
import { Outlet } from 'react-router';

function MainLayout() {
  return (
    // <AuthContextProvider>
    <div className="bg-slate-600 text-gray-300 flex flex-col min-h-screen">
      <main className="grow flex flex-col justify-between py-4">
        <Outlet />
      </main>
      <Navbar />
    </div>
    // </AuthContextProvider>
  );
}

export default MainLayout;
