import { useState, useEffect, useRef } from 'react';
import Autocomplete from '../components/Autocomplete';
import DataTable from '../components/DataTable';
import Tabs from '../components/Tabs';
import { fetchItems, fetchItemStock } from '../services/itemService';
import { fetchUnits, fetchUnitStock } from '../services/unitService';
import '../styles/global.css';
import '../styles/buttons.css';
import '../styles/overlay.css'; 

type Item = { id: string; name: string };
type Batch = { batch: string; expiry_date: string; quantity: number };
type UnitStock = Record<string, Batch[]>;
type ItemStock = Record<string, Batch[]>;

type TransformedData = {
  unit?: string;
  name?: string;
  batch: string;
  expiry_date: string;
  quantity: number;
};

const HomePage = () => {
  const [data, setData] = useState<TransformedData[]>([]);
  const [searchType, setSearchType] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Item | null>(null);
  const itemDictionaryRef = useRef<{ [key: string]: string }>({}); // Dictionary for items
  const unitDictionaryRef = useRef<{ [key: string]: string }>({}); // Dictionary for units
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Carregando...");
  const [query, setQuery] = useState('');
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [allOptions, setAllOptions] = useState<Item[]>([]);

  useEffect(() => {
    const fetchInitialOptions = async () => {
      const options = searchType === 0 ? await fetchItems() : await fetchUnits();
      setAllOptions(options);
      
      // Build dictionary based on search type
      if (searchType === 0) {
        // Populate item dictionary
        itemDictionaryRef.current = options.reduce((acc, option) => {
          acc[option.id] = option.name;
          return acc;
        }, {} as { [key: string]: string });
        console.log("Item Dictionary Loaded:", itemDictionaryRef.current);
      } else {
        // Populate unit dictionary
        unitDictionaryRef.current = options.reduce((acc, option) => {
          acc[option.id] = option.name;
          return acc;
        }, {} as { [key: string]: string });
        console.log("Unit Dictionary Loaded:", unitDictionaryRef.current);
      }
    };
    fetchInitialOptions();
  }, [searchType]);

  const handleSelect = (option: Item) => {
    setSelectedOption(option);
    setQuery(option.name);
    setShowAllOptions(false);
  };

  const handleSearch = async () => {
    if (!selectedOption) return;

    setLoading(true);
    setLoadingMessage("Carregando...");

    const timeoutId = setTimeout(() => {
      setLoadingMessage("Por favor, não atualize a página. O carregamento de todos os itens da UBS pode levar até 30 segundos.");
    }, 3000);

    try {
      const responseData: ItemStock | UnitStock = searchType === 0
        ? await fetchItemStock(selectedOption.id)
        : await fetchUnitStock(selectedOption.id);

      const transformedData: TransformedData[] = searchType === 0
        ? Object.entries(responseData).flatMap(([unitId, items]) => {
            const unitName = unitDictionaryRef.current[unitId]; // Lookup unit name
            return items.map((item) => ({
              unit: unitName || unitId, // Use unit name if available
              batch: item.batch,
              expiry_date: item.expiry_date,
              quantity: item.quantity,
            }));
          })
        : Object.entries(responseData).flatMap(([itemId, batches]) => {
            const itemName = itemDictionaryRef.current[itemId]; // Lookup item name
            return batches.map((batch) => ({
              name: itemName || itemId, // Use item name if available
              batch: batch.batch,
              expiry_date: batch.expiry_date,
              quantity: batch.quantity,
            }));
          });

      setData(transformedData);
      setQuery('');
    } catch (error) {
      console.error("Error fetching data", error);
    }

    clearTimeout(timeoutId);
    setLoading(false);
  };

  const handleTabChange = (index: number) => {
    setSearchType(index);
    setSelectedOption(null);
    setData([]);
  };

  const handleToggleList = () => {
    setShowAllOptions((prev) => !prev);
  };

  return (
    <div className="container">
      <Tabs labels={['Procurar por medicamento', 'Procurar por unidade']} onTabChange={handleTabChange} />
      <Autocomplete
        options={allOptions}
        onSelect={handleSelect}
        query={query}
        setQuery={setQuery}
        placeholder={searchType === 0 ? 'Digite o nome do medicamento' : 'Digite o nome da unidade'}
        onToggleList={handleToggleList}
      />
      <button onClick={handleSearch} className={`search-button ${loading ? 'loading' : ''}`} disabled={loading}>
        {loading ? <span className="spinner"></span> : 'Buscar'}
      </button>
      {loading && (
        <div className="loading-overlay">
          <div className="overlay-spinner"></div>
          <p>{loadingMessage}</p>
          <div className="progress-bar-container">
            <div className="progress-bar"></div>
          </div>
        </div>
      )}
      {showAllOptions && (
        <div className="all-options-list">
          {allOptions.map((option) => (
            <div key={option.id} onClick={() => handleSelect(option)} className="all-options-item">
              {option.name}
            </div>
          ))}
        </div>
      )}
      {data.length > 0 && !loading && (
        <DataTable
          data={data}
          searchType={searchType}
          unitName={searchType === 1 ? selectedOption?.name : undefined}
          itemName={searchType === 0 ? selectedOption?.name : undefined}
        />
      )}
    </div>
  );
};

export default HomePage;
