import { useState } from 'react';
import '../styles/datatable.css';


export type TransformedData = {
  unit?: string;
  name?: string;
  item_id: number;
  batch: string;
  expiry_date: string;
  quantity: number;
};


interface DataTableProps {
  data: TransformedData[];
  searchType: number;
  unitName?: string;
  itemName?: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, searchType, unitName, itemName }) => {
  const [sortState, setSortState] = useState<{ [key: string]: number }>({});

  const handleSort = (key: string) => {
    setSortState((prev) => {
      const newState = { ...prev, [key]: (prev[key] || 0) + 1 };
      if (newState[key] > 2) newState[key] = 0;
      return newState;
    });
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  const sortedData = [...data].sort((a, b) => {
    for (const [key, order] of Object.entries(sortState)) {
      if (order === 1) {
        if (key === 'expiry_date') {
          return parseDate(a.expiry_date) > parseDate(b.expiry_date) ? 1 : -1;
        } else if (key === 'quantity') {
          return a.quantity - b.quantity;
        } else if (key === 'batch') {
          return a.batch.localeCompare(b.batch);
        } else if (key === 'unit' && a.unit && b.unit) {
          return a.unit.localeCompare(b.unit);
        } else if (key === 'name' && a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
      } else if (order === 2) {
        if (key === 'expiry_date') {
          return parseDate(a.expiry_date) < parseDate(b.expiry_date) ? 1 : -1;
        } else if (key === 'quantity') {
          return b.quantity - a.quantity;
        } else if (key === 'batch') {
          return b.batch.localeCompare(a.batch);
        } else if (key === 'unit' && a.unit && b.unit) {
          return b.unit.localeCompare(a.unit);
        } else if (key === 'name' && a.name && b.name) {
          return b.name.localeCompare(a.name);
        }
      }
    }
    return 0;
  });

  const columns = searchType === 0
    ? ['Unidade', 'Lote', 'Data de Validade', 'Quantidade']  // Show unit name for 'Procurar por medicamento'
    : ['Nome', 'Lote', 'Data de Validade', 'Quantidade'];    // Show item name for 'Procurar por unidade'

  return (
    <div>
      {searchType === 0 && itemName && <h2>{itemName}</h2>}
      {searchType === 1 && unitName && <h2>{unitName}</h2>}
      
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} onClick={() => handleSort(column)}>
                  {column} {sortState[column] === 1 ? '↑' : sortState[column] === 2 ? '↓' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx}>
                {searchType === 0 && (
                  <td data-label="Unidade">{row.unit ?? ''}</td>   
                )}
                {searchType === 1 && (
                  <td data-label="Nome">{row.name ?? ''}</td>   
                )}
                <td data-label="Lote">{row.batch}</td>
                <td data-label="Data de Validade">{row.expiry_date}</td>
                <td data-label="Quantidade">{row.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;