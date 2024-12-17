// src/pages/OrdersPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUnits } from '../services/unitService';
import { Unit } from '../types/Unit';
import SearchIcon from '@mui/icons-material/Search';
import '../styles/global.css';

const OrdersPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnitsData = async () => {
      const unitsData = await fetchUnits();
      setUnits(unitsData);
    };

    fetchUnitsData();
  }, []);

  const handleIconClick = (unitId: string) => {
    navigate(`/pedidos/${unitId}`);
  };

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="back-button">← Voltar</button>
      <h1>Pedidos</h1>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Unidade</th>
              <th>Pedido</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id}>
                <td>{unit.name}</td>
                <td>
                  <SearchIcon className="pedido-icon clickable" onClick={() => handleIconClick(unit.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
