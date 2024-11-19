import { useState } from "react";
import "../styles/datatable.css";

type TransformedData = {
  unit?: string;
  name?: string;
  item_id?: number;
  batch: string;
  expiry_date?: string;
  timestamp?: string;
  quantity: number;
  operation_type?: string;
};

interface DataTableProps {
  data: TransformedData[];
  searchType: number; // 0: Medicamento, 1: Unidade, 2: Dispensação
  unitName?: string;
  itemName?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  searchType,
  unitName,
  itemName,
}) => {
  const [sortState, setSortState] = useState<{ [key: string]: number }>({});

  const handleSort = (key: string) => {
    setSortState((prev) => {
      const newState = { ...prev, [key]: (prev[key] || 0) + 1 };
      if (newState[key] > 2) newState[key] = 0;
      return newState;
    });
  };

  const parseDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getTime();
  };

  const sortedData = [...data].sort((a, b) => {
    for (const [key, order] of Object.entries(sortState)) {
      if (order === 1) {
        if (key === "expiry_date" || key === "timestamp") {
          return parseDate(a[key] || "") > parseDate(b[key] || "") ? 1 : -1;
        } else if (key === "quantity") {
          return a.quantity - b.quantity;
        } else if (key === "batch") {
          return a.batch.localeCompare(b.batch);
        } else if (key === "unit" && a.unit && b.unit) {
          return a.unit.localeCompare(b.unit);
        } else if (key === "name" && a.name && b.name) {
          return a.name.localeCompare(b.name);
        }
      } else if (order === 2) {
        if (key === "expiry_date" || key === "timestamp") {
          return parseDate(a[key] || "") < parseDate(b[key] || "") ? 1 : -1;
        } else if (key === "quantity") {
          return b.quantity - a.quantity;
        } else if (key === "batch") {
          return b.batch.localeCompare(a.batch);
        } else if (key === "unit" && a.unit && b.unit) {
          return b.unit.localeCompare(a.unit);
        } else if (key === "name" && a.name && b.name) {
          return b.name.localeCompare(a.name);
        }
      }
    }
    return 0;
  });

  const columns =
    searchType === 2
      ? ["Lote", "Data/Hora", "Quantidade", "Tipo de Operação"] // Dispensação
      : searchType === 0
      ? ["Unidade", "Lote", "Data de Validade", "Quantidade"] // Medicamento
      : ["Nome", "Lote", "Data de Validade", "Quantidade"]; // Unidade

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
                  {column}{" "}
                  {sortState[column] === 1
                    ? "↑"
                    : sortState[column] === 2
                    ? "↓"
                    : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => console.log("Row clicked:", row)} // Replace with desired behavior
              >
                {searchType === 0 && (
                  <td data-label="Unidade">{row.unit ?? ""}</td>
                )}
                {searchType === 1 && (
                  <td data-label="Nome">{row.name ?? ""}</td>
                )}
                <td data-label="Lote">{row.batch}</td>
                {searchType === 2 ? (
                  <>
                    <td data-label="Data/Hora">{row.timestamp ?? ""}</td>
                    <td data-label="Quantidade">{row.quantity}</td>
                    <td data-label="Tipo de Operação">
                      {row.operation_type ?? ""}
                    </td>
                  </>
                ) : (
                  <>
                    <td data-label="Data de Validade">
                      {row.expiry_date ?? ""}
                    </td>
                    <td data-label="Quantidade">{row.quantity}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
