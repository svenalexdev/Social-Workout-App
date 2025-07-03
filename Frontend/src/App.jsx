import { BrowserRouter, Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Plans from './pages/Plans';
import CreatePlan from './pages/CreatePlan';
import ExercisingPlan from './pages/ExercisingPlan';
import AllPlans from './pages/AllPlans';
import LoginSignup from './pages/LoginSignup';
import SignUp from './pages/SignUp';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="plans" element={<Plans />} />
            <Route path="createplan" element={<CreatePlan />} />
            <Route path="exercisingplan" element={<ExercisingPlan />} />
            <Route path="seeallmyplans" element={<AllPlans />} />
            <Route path="signin" element={<LoginSignup />} />
             <Route path="signup" element={<SignUp />} />
          </Route>
          {/* <Route path='*' element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
