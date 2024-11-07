// HomePage.tsx (updated to handle async options in `showAllOptions`)
import { useState, useEffect } from 'react';
import Autocomplete from '../components/Autocomplete';
import DataTable from '../components/DataTable';
import Tabs from '../components/Tabs';
import { fetchItems, fetchItemStock } from '../services/itemService';
import { fetchUnits, fetchUnitStock } from '../services/unitService';

// Define types for items and batches
type Item = { id: string; name: string };
type Batch = { batch: string; expiry_date: string; quantity: number };
type UnitStock = Record<string, Batch[]>;
type ItemStock = Record<string, Batch[]>;

// Define the type for transformedData entries
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
  const [itemDictionary, setItemDictionary] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Carregando...");
  const [query, setQuery] = useState(''); // Added query state to control Autocomplete input
  const [showAllOptions, setShowAllOptions] = useState(false); // Added state for toggling list
  const [allOptions, setAllOptions] = useState<Item[]>([]); // Store all options

  useEffect(() => {
    fetchItems().then((items: Item[]) => {
      const dictionary = items.reduce((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {} as { [key: string]: string });
      setItemDictionary(dictionary);
    });
  }, []);

  const handleSelect = (option: Item) => {
    setSelectedOption(option);
    setQuery(option.name); // Set query to selected option name
    setShowAllOptions(false); // Close the list when an option is selected
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
        ? Object.entries(responseData).flatMap(([unitName, items]) =>
            items.map((item) => ({
              unit: unitName,
              batch: item.batch,
              expiry_date: item.expiry_date,
              quantity: item.quantity,
            }))
          )
        : Object.entries(responseData).flatMap(([itemId, batches]) =>
            batches.map((batch) => ({
              name: itemDictionary[itemId] || itemId,
              batch: batch.batch,
              expiry_date: batch.expiry_date,
              quantity: batch.quantity,
            }))
          );

      setData(transformedData);
      setQuery(''); // Clear query after search completes
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

    // Fetch all options when toggling the list on
    if (!showAllOptions) {
      const fetchFunction = searchType === 0 ? fetchItems : fetchUnits;
      fetchFunction().then(setAllOptions);
    }
  };

  return (
    <div className="container">
      <Tabs labels={['Procurar por medicamento', 'Procurar por unidade']} onTabChange={handleTabChange} />
      <Autocomplete
        fetchOptions={searchType === 0 ? fetchItems : fetchUnits}
        onSelect={handleSelect}
        query={query}
        setQuery={setQuery} // Pass setQuery function
        placeholder={searchType === 0 ? 'Digite o nome do medicamento' : 'Digite o nome da unidade'}
        onToggleList={handleToggleList} // Pass toggle function
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
