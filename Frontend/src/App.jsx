import { BrowserRouter, Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Plans from './pages/Plans';
import CreatePlan from './pages/CreatePlan';
import ExercisingPlan from './pages/ExercisingPlan';
import AllPlans from './pages/AllPlans';
import LoginSignup from './pages/LoginSignup';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import ProtectedLayout from './components/ProtectedRoute';
import GroupFinder from './pages/GroupFinder';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            {/* <Route path="plans" element={<Plans />} /> */}
            <Route path="plans" element={<ProtectedLayout />}>
              <Route index element={<Plans />} />
           </Route>
            <Route path="createplan" element={<ProtectedLayout />}>
              <Route index element={<CreatePlan />} />
            </Route>
            <Route path="exercisingplan" element={<ProtectedLayout />}>
              <Route index element={<ExercisingPlan />} />
            </Route>
            <Route path="allplans" element={<ProtectedLayout />}>
              <Route index element={<AllPlans />} />
            </Route>
            <Route path="signin" element={<LoginSignup />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="profile" element={<Profile />} />
            <Route path="groupfinder" element={<GroupFinder />} />

           
          </Route>
          {/* <Route path='*' element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
