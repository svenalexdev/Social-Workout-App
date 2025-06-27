import { BrowserRouter, Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Plans from './pages/Plans';
import CreatePlan from './pages/CreatePlan';
import ExercisingPlan from './pages/ExercisingPlan';

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
          </Route>
          {/* <Route path='*' element={<NotFound />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
