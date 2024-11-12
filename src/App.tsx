import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import UnitDetailsPage from './pages/UnitDetailsPage';
import Sidebar from './components/Sidebar';
import OptionsPage from './pages/OptionsPage';
import './styles/global.css';

const App = () => (
  <Router>
    <div className="app-container">
      <Sidebar />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pedidos" element={<OrdersPage />} />
          <Route path="/pedidos/:unitId" element={<UnitDetailsPage />} />
          <Route path="/opcoes" element={<OptionsPage />} />
        </Routes>
      </div>
    </div>
  </Router>
);

export default App;
