import { useState, useEffect, useRef } from "react";
import Autocomplete from "../components/Autocomplete";
import { fetchUnits } from "../services/unitService";
import { fetchItems } from "../services/itemService";
import { fetchRestockSummed } from "../services/restockService";
import "../styles/global.css";
import "../styles/buttons.css";

type Item = { id: string; name: string };
type RestockData = {
    item_id: number;
    unit_id: number;
    total_quantity: number;
    item_name?: string;
  };

const RestockHistoryPage = () => {
  const [data, setData] = useState<RestockData[]>([]);
  const [unitQuery, setUnitQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<Item | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Item[]>([]);
  const [itemDictionary, setItemDictionary] = useState<{ [key: string]: string }>({});
  const unitDictionaryRef = useRef<{ [key: string]: string }>({});

  // Fetch units and items on initial load
  useEffect(() => {
    const fetchUnitsAndItems = async () => {
      const fetchedUnits = await fetchUnits();
      setUnits(fetchedUnits);

      // Create a dictionary for unit lookup
      unitDictionaryRef.current = fetchedUnits.reduce((acc, unit) => {
        acc[unit.id] = unit.name;
        return acc;
      }, {} as { [key: string]: string });

      // Fetch items and create a dictionary for item lookup
      const fetchedItems = await fetchItems();
      const itemDict = fetchedItems.reduce((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {} as { [key: string]: string });

      setItemDictionary(itemDict);
    };

    fetchUnitsAndItems();
  }, []);

  const handleSearch = async () => {
    if (!selectedUnit || !date) return;
  
    setLoading(true);
    try {
      const response = await fetchRestockSummed(date);
  
      // Filter data for the selected unit
      const filteredData = response.filter((entry) => entry.unit_id === Number(selectedUnit.id));
  
      // Map item_id to item_name using the dictionary
      const transformedData = filteredData.map((entry) => ({
        ...entry, // Preserve original properties
        item_name: itemDictionary[entry.item_id] || "Desconhecido", // Add item_name
      }));
  
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching restock history data", error);
    }
    setLoading(false);
  };

  const handleToggleUnitList = () => setUnitQuery("");

  return (
    <div className="container">
      <h1>Histórico de Pedidos</h1>
      <div className="filter-container">
        <Autocomplete
          options={units}
          onSelect={setSelectedUnit}
          query={unitQuery}
          setQuery={setUnitQuery}
          placeholder="Digite o nome da unidade"
          onToggleList={handleToggleUnitList}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
        <button onClick={handleSearch} className={`button search-button ${loading ? "loading" : ""}`} disabled={loading}>
          {loading ? "Carregando..." : "Buscar"}
        </button>
      </div>

      {data.length === 0 && !loading && selectedUnit && (
        <p className="no-data">Nenhuma entrada registrada nesse período</p>
      )}

      {data.length > 0 && selectedUnit && (
        <>
          <h2>
            Entradas para Unidade {selectedUnit.name} em {date}
          </h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Quantidade Total</th>
                </tr>
              </thead>
              <tbody>
            {data.map((row, index) => (
                <tr key={index}>
                <td>{row.item_name || "Desconhecido"}</td> {/* Use item_name if available */}
                <td>{row.total_quantity}</td>
                </tr>
            ))}
            </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default RestockHistoryPage;
