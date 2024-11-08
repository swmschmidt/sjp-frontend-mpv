import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import UnitDetailsPage from './pages/UnitDetailsPage';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pedidos" element={<OrdersPage />} />
      <Route path="/pedidos/:unitId" element={<UnitDetailsPage />} />
    </Routes>
  </Router>
);

export default App;