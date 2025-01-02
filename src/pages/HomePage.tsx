import { useState, useEffect, useRef } from 'react';
import Autocomplete from '../components/Autocomplete';
import DataTable from '../components/DataTable';
import Tabs from '../components/Tabs';
import { fetchItems, fetchItemStock } from '../services/itemService';
import { fetchUnits, fetchUnitStock } from '../services/unitService';
import '../styles/global.css';
import '../styles/buttons.css';
import '../styles/overlay.css';
import FloatingHelpButton from '../components/FloatingHelpButton';

type Item = { id: string; name: string };
type Batch = { item_id: number; batch: string; expiry_date: string; quantity: number };
type UnitStock = Record<string, Batch[]>;
type ItemStock = Record<string, Batch[]>;

type TransformedData = {
  unit?: string;
  name?: string;
  item_id?: number;
  batch: string;
  expiry_date: string;
  quantity: number;
};

const HomePage = () => {
  const [data, setData] = useState<TransformedData[]>([]);
  const [searchType, setSearchType] = useState(0); // 0: Search by item, 1: Search by unit
  const [selectedOption, setSelectedOption] = useState<Item | null>(null);
  const itemDictionaryRef = useRef<{ [key: string]: string }>({});
  const unitDictionaryRef = useRef<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando...');
  const [query, setQuery] = useState('');
  const [allOptions, setAllOptions] = useState<Item[]>([]);

  useEffect(() => {
    if (Object.keys(unitDictionaryRef.current).length === 0) {
      fetchAndSetUnits();
    }
  }, []);

  useEffect(() => {
    const fetchInitialOptions = async () => {
      const options = searchType === 0 ? await fetchItems() : await fetchAndSetUnits();
      setAllOptions(options);

      if (searchType === 0) {
        itemDictionaryRef.current = options.reduce((acc, option) => {
          acc[option.id] = option.name;
          return acc;
        }, {} as { [key: string]: string });
      }
    };
    fetchInitialOptions();
  }, [searchType]);

  const fetchAndSetUnits = async () => {
    const units = await fetchUnits();
    unitDictionaryRef.current = units.reduce((acc, unit) => {
      acc[unit.id] = unit.name;
      return acc;
    }, {} as { [key: string]: string });
    return units;
  };

  const handleSelect = (option: Item) => {
    setSelectedOption(option);
    setQuery(option.name);
  };

  const handleSearch = async () => {
    if (!selectedOption) return;

    setLoading(true);
    setLoadingMessage('Carregando...');

    const timeoutId = setTimeout(() => {
      setLoadingMessage(
        'Por favor, não atualize a página. O carregamento de todos os itens da UBS pode levar até 30 segundos.'
      );
    }, 3000);

    try {
      const responseData: {
        timestamp?: string;
        data?: ItemStock | UnitStock;
        items?: Array<{ batch: string; expiry_date: string; item_name: string; quantity: number }>;
      } =
        searchType === 0
          ? await fetchItemStock(selectedOption.id)
          : await fetchUnitStock(selectedOption.id);

      console.log('Raw Response Data:', responseData);

      let transformedData: TransformedData[];

      if (responseData.items) {
        transformedData = responseData.items.map((item) => ({
          name: item.item_name,
          batch: item.batch,
          expiry_date: item.expiry_date,
          quantity: item.quantity,
        }));
      } else {
        transformedData =
          searchType === 0
            ? Object.entries(responseData.data || {}).flatMap(([unitId, batches]) => {
                const unitName = unitDictionaryRef.current[unitId] || unitId;
                return Array.isArray(batches)
                  ? batches.map((batch) => ({
                      unit: unitName,
                      item_id: batch.item_id,
                      batch: batch.batch,
                      expiry_date: batch.expiry_date,
                      quantity: batch.quantity,
                    }))
                  : [];
              })
            : Object.entries(responseData.data || {}).flatMap(([unitId, items]) => {
                const unitName = unitDictionaryRef.current[unitId] || unitId;
                return Array.isArray(items)
                  ? items.map((item) => ({
                      unit: unitName,
                      name: itemDictionaryRef.current[item.item_id.toString()] || item.item_id.toString(),
                      item_id: item.item_id,
                      batch: item.batch,
                      expiry_date: item.expiry_date,
                      quantity: item.quantity,
                    }))
                  : [];
              });
      }

      console.log('Transformed Data:', transformedData);

      setData(transformedData);
      setQuery('');
    } catch (error) {
      console.error('Error fetching data', error);
    }

    clearTimeout(timeoutId);
    setLoading(false);
  };

  const handleTabChange = (index: number) => {
    setSearchType(index);
    setSelectedOption(null);
    setData([]);
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
        onToggleList={() => {}}
      />
      <button onClick={handleSearch} className={`button search-button ${loading ? 'loading' : ''}`} disabled={loading}>
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
      {data.length > 0 && !loading && (
        <DataTable
          data={data}
          searchType={searchType}
          unitName={searchType === 1 ? selectedOption?.name : undefined}
          itemName={searchType === 0 ? selectedOption?.name : undefined}
        />
      )}
      <FloatingHelpButton description="Nesta página você pode buscar medicamentos de forma parecida com o Portal da Transparência.
      A busca 'por medicamento' irá mostrar o estoque do medicamento selecionado em todas as unidades.
      A busca 'por unidade' irá mostrar todo o estoque de medicamentos da REMUME da unidade selecionada.
      Os estoques aqui são atualizados a cada 1 hora." />
    </div>
  );
};

export default HomePage;
