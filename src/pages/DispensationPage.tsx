import { useState, useEffect, useRef } from "react";
import Autocomplete from "../components/Autocomplete";
import DataTable from "../components/DataTable";
import Tabs from "../components/Tabs";
import { fetchUnits } from "../services/unitService";
import { fetchItems } from "../services/itemService";
import {
  fetchDispensationByHour,
  fetchDispensationByDay,
} from "../services/dispensationService";
import "../styles/global.css";
import "../styles/buttons.css";
import "../styles/overlay.css";

type Item = { id: string; name: string };
type TransformedData = {
  batch: string;
  timestamp?: string;
  expiry_date?: string;
  quantity: number;
  operation_type: string;
  name?: string; // For translating item names
};

const DispensationPage = () => {
  const [data, setData] = useState<TransformedData[]>([]);
  const [tabIndex, setTabIndex] = useState(0); // 0: Por Hora, 1: Por Dia
  const [selectedUnit, setSelectedUnit] = useState<Item | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const unitDictionaryRef = useRef<{ [key: string]: string }>({});
  const itemDictionaryRef = useRef<{ [key: string]: string }>({});
  const [unitQuery, setUnitQuery] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [units, setUnits] = useState<Item[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [showAllUnits, setShowAllUnits] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch units and items on load
  useEffect(() => {
    fetchAndSetUnits();
    fetchAndSetItems();
  }, []);

  const fetchAndSetUnits = async () => {
    try {
      const fetchedUnits = await fetchUnits();
      unitDictionaryRef.current = fetchedUnits.reduce((acc, unit) => {
        acc[unit.id] = unit.name;
        return acc;
      }, {} as { [key: string]: string });
      setUnits(fetchedUnits);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const fetchAndSetItems = async () => {
    try {
      const fetchedItems = await fetchItems();
      itemDictionaryRef.current = fetchedItems.reduce((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {} as { [key: string]: string });
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleFetchData = async () => {
    if (!selectedUnit || (tabIndex === 0 && !selectedItem) || !date) return;

    setLoading(true);
    try {
      const response =
        tabIndex === 0
          ? await fetchDispensationByHour(selectedUnit.id, selectedItem!.id, date)
          : await fetchDispensationByDay(selectedUnit.id, date);

      const transformedData = response.map((item: any) => ({
        batch: item[7], // Batch
        timestamp: tabIndex === 0 ? new Date(item[4]).toLocaleString() : undefined, // Timestamp for Por Hora
        expiry_date: tabIndex === 1 ? item[2] : undefined, // Expiry Date for Por Dia
        quantity: item[5], // Quantity
        operation_type: item[6] === "dispensation" ? "Saída" : item[6], // Translate "dispensation" to "Saída"
        name: itemDictionaryRef.current[item[1]] || `Item ${item[1]}`, // Translate item name
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching dispensation data:", error);
    }
    setLoading(false);
  };

  const handleToggleUnitList = () => setShowAllUnits((prev) => !prev);
  const handleToggleItemList = () => setShowAllItems((prev) => !prev);

  const handleUnitSelect = (unit: Item) => {
    setSelectedUnit(unit);
    setUnitQuery(unit.name);
    setShowAllUnits(false);
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    setItemQuery(item.name);
    setShowAllItems(false);
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    setData([]);
    setSelectedItem(null); // Clear selected item when switching tabs
  };

  return (
    <div className="container">
      <img src="/logo.svg" alt="Logo" className="logo" />
      <Tabs labels={["Por Hora", "Por Dia"]} onTabChange={handleTabChange} />
      <div className="filter-container">
        <Autocomplete
          options={units}
          onSelect={handleUnitSelect}
          query={unitQuery}
          setQuery={setUnitQuery}
          placeholder="Digite o nome da unidade"
          onToggleList={handleToggleUnitList}
        />
        {tabIndex === 0 && (
          <Autocomplete
            options={items}
            onSelect={handleItemSelect}
            query={itemQuery}
            setQuery={setItemQuery}
            placeholder="Digite o nome do medicamento"
            onToggleList={handleToggleItemList}
          />
        )}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
        <button
          onClick={handleFetchData}
          className={`button search-button ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Carregando..." : "Buscar"}
        </button>
      </div>
      {loading && <p>Carregando dados...</p>}
      {data.length > 0 && (
        <DataTable
          data={data}
          searchType={tabIndex === 0 ? 2 : 1} // 2: Por Hora, 1: Por Dia
          unitName={selectedUnit?.name}
        />
      )}
    </div>
  );
};

export default DispensationPage;
