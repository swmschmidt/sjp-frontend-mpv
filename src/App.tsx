import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import UnitDetailsPage from './pages/UnitDetailsPage';
import Sidebar from './components/Sidebar';
import OptionsPage from './pages/OptionsPage';
import OptionsSelectPage from './pages/OptionsSelectPage';
import DispensationPage from "./pages/DispensationPage";
import OutOfStockSelectPage from './pages/OutOfStockSelectPage';
import OutOfStockPage from './pages/OutOfStockPage';
import AnalysisSelectPage from './pages/AnalysisSelectPage';
import AnalysisPage from './pages/AnalysisPage';
import CalculationTablePage from './pages/CalculationTablePage';
import './styles/global.css';
import RestockHistoryPage from './pages/RestockHistoryPage';

const App = () => (
  <Router>
    <div className="app-container">
      <Sidebar />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pedidos" element={<OrdersPage />} />
          <Route path="/pedidos/:unitId" element={<UnitDetailsPage />} />
          <Route path="/historico-pedidos" element={<RestockHistoryPage />} />
          <Route path="/faltas" element={<OutOfStockSelectPage />} />3
          <Route path="/faltas/:unitId" element={<OutOfStockPage />} />
          <Route path="/dispensacao" element={<DispensationPage />} />
          <Route path="/analise" element={<AnalysisSelectPage />} />
          <Route path="/analise/:unitId" element={<AnalysisPage />} />
          <Route path="/opcoes" element={<OptionsSelectPage />} />
          <Route path="/opcoes/:unitId" element={<OptionsPage />} />
          <Route path="/calculadora" element={<CalculationTablePage />} />
        </Routes>
      </div>
    </div>
  </Router>
);

export default App;