// src/pages/OrdersPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUnits } from '../services/unitService';
import { fetchUniqueRestockUnits } from '../services/restockService';
import { Unit } from '../types/Unit';
import '../styles/global.css';

const OrdersPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [restockStatus, setRestockStatus] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnitsAndStatus = async () => {
      const unitsData = await fetchUnits();
      setUnits(unitsData);

      const uniqueRestockUnitIds = await fetchUniqueRestockUnits();
      const statusMap = unitsData.reduce((acc, unit) => {
        acc[unit.id] = uniqueRestockUnitIds.includes(unit.id);
        return acc;
      }, {} as { [key: string]: boolean });

      setRestockStatus(statusMap);
    };

    fetchUnitsAndStatus();
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
                  <span
                    className={`pedido-icon ${restockStatus[unit.id] ? 'pedido-available' : 'pedido-unavailable'}`}
                    onClick={() => restockStatus[unit.id] && handleIconClick(unit.id)}
                  >
                    {restockStatus[unit.id] ? '🟢' : '🔴'}
                  </span>
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
