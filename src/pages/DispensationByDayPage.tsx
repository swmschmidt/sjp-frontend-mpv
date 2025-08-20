import { useState, useEffect, useRef } from "react";
import Autocomplete from "../components/Autocomplete";
import DataTable from "../components/DataTable";
import { fetchDispensationByDay } from "../services/dispensationService";
import { fetchUnits } from "../services/unitService";
import { fetchItems } from "../services/itemService";
import "../styles/global.css";
import "../styles/buttons.css";
import "../styles/dispensation.css";
import FloatingFeedbackButton from "../components/FloatingFeedbackButton";
import FloatingHelpButton from "../components/FloatingHelpButton";
import PageTracker from "../components/PageTracker";

type Item = { id: string; name: string };
type TransformedData = {
  batch: string;
  quantity: number;
  item_name?: string;
  quantity_received?: number;
  quantity_dispensed?: number;
};

const DispensationByDayPage = () => {
  const [data, setData] = useState<TransformedData[]>([]);
  const [unitQuery, setUnitQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<Item | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // Default to today's date
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Item[]>([]);
  const itemDictionaryRef = useRef<{ [key: string]: string }>({});

  // Fetch units and items on initial load
  useEffect(() => {
    const fetchData = async () => {
      const fetchedUnits = await fetchUnits();
      const fetchedItems = await fetchItems();
      setUnits(fetchedUnits);

      // Create dictionary for item lookup
      itemDictionaryRef.current = fetchedItems.reduce((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {} as { [key: string]: string });
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!selectedUnit || !date) return;

    setLoading(true);
    try {
      const response = await fetchDispensationByDay(selectedUnit.id, date);
      const transformedData = response
        .map((item: any) => {
          const itemId = item[0];
          const quantityReceived = item[1];
          const quantityDispensed = item[2];
          const itemName = itemDictionaryRef.current[itemId] || `ID: ${itemId}`;
          
          return {
            batch: "", // Not used in this view
            quantity: 0, // Not used in this view
            item_name: itemName,
            quantity_received: quantityReceived,
            quantity_dispensed: quantityDispensed,
          };
        })
        .filter((entry: TransformedData) => 
          (entry.quantity_received || 0) > 0 || (entry.quantity_dispensed || 0) > 0
        ); // Only show items with activity
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching dispensation data", error);
    }
    setLoading(false);
  };

  const handleToggleUnitList = () => setUnitQuery("");

  return (
    <div className="container">
      <PageTracker />
      <h1>Dados de Dispensação por Dia</h1>
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
      {data.length > 0 && (
        <DataTable
          data={data}
          searchType={3} // New type for dispensation by day
        />
      )}
      <FloatingFeedbackButton />
      <FloatingHelpButton description="" />
    </div>
  );
};

export default DispensationByDayPage;
