// src/pages/UnitDetailsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUnitRestockDetails, fetchUnitRestockDetailsBig, fetchUnitRestockDetailsSmall } from '../services/restockService';
import { fetchItems } from '../services/itemService';
import { fetchUnits } from '../services/unitService';
import { Item } from '../types/Item';
import { Unit } from '../types/Unit';
import '../styles/global.css';

type RestockDetail = {
  item_id: string;
  restock_request_quantity: number;
  timestamp: string;
};

const UnitDetailsPage = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [restockDetails, setRestockDetails] = useState<RestockDetail[]>([]);
  const [itemsDictionary, setItemsDictionary] = useState<{ [key: string]: string }>({});
  const [unitsDictionary, setUnitsDictionary] = useState<{ [key: string]: string }>({});
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('normal');

  useEffect(() => {
    const fetchDetails = async () => {
      let details: RestockDetail[] = [];
      if (selectedTab === 'normal') {
        details = await fetchUnitRestockDetails(unitId!);
      } else if (selectedTab === 'big') {
        details = await fetchUnitRestockDetailsBig(unitId!);
      } else if (selectedTab === 'small') {
        details = await fetchUnitRestockDetailsSmall(unitId!);
      }
      setRestockDetails(details || []);
      if (details.length > 0) {
        setLastUpdated(new Date(details[0].timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
      }
    };

    const fetchItemsDictionary = async () => {
      const items = await fetchItems();
      const dictionary = items.reduce((acc: { [key: string]: string }, item: Item) => {
        acc[item.id] = item.name;
        return acc;
      }, {});
      setItemsDictionary(dictionary);
    };

    const fetchUnitsDictionary = async () => {
      const units = await fetchUnits();
      const dictionary = units.reduce((acc: { [key: string]: string }, unit: Unit) => {
        acc[unit.id] = unit.name;
        return acc;
      }, {});
      setUnitsDictionary(dictionary);
    };

    fetchDetails();
    fetchItemsDictionary();
    fetchUnitsDictionary();
  }, [unitId, selectedTab]);

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="back-button">← Voltar</button>
      <h1>Sugestões de pedido para {unitsDictionary[unitId!] || unitId}</h1>
      {lastUpdated && <p>Última atualização: {lastUpdated}</p>}
      <div className="tabs">
        <button onClick={() => setSelectedTab('small')} className={selectedTab === 'small' ? 'active' : ''}>Pedido pequeno</button>
        <button onClick={() => setSelectedTab('normal')} className={selectedTab === 'normal' ? 'active' : ''}>Pedido normal</button>
        <button onClick={() => setSelectedTab('big')} className={selectedTab === 'big' ? 'active' : ''}>Pedido grande</button>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Quantidade a Pedir</th>
            </tr>
          </thead>
          <tbody>
            {restockDetails
              .filter(detail => detail.restock_request_quantity > 0)
              .map((detail) => (
                <tr key={detail.item_id}>
                  <td>{detail.item_id}</td>
                  <td>{itemsDictionary[detail.item_id] || detail.item_id}</td>
                  <td>{detail.restock_request_quantity}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnitDetailsPage;
