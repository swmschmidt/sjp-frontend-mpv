import { useState } from 'react';
import '../styles/autocomplete.css';

interface Option {
  id: string;
  name: string;
}

interface AutocompleteProps {
  options: Option[];
  onSelect: (option: Option) => void;
  query: string;
  setQuery: (value: string) => void;
  placeholder: string;
  onToggleList: () => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ options, onSelect, query, setQuery, placeholder, onToggleList }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (option: Option) => {
    setQuery(option.name);
    setShowDropdown(false);
    onSelect(option);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length >= 3);
  };

  return (
    <div className="autocomplete-wrapper">
      <button onClick={onToggleList} className="list-toggle-button" title={placeholder.includes("medicamento") ? "Ver todos os medicamentos da REMUME" : "Ver todas as unidades"}>
        ☰
      </button>
      <div className="autocomplete-container">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="autocomplete-input"
        />
        {showDropdown && (
          <ul className="autocomplete-list">
            {options
              .filter((option) => option.name.toLowerCase().includes(query.toLowerCase()))
              .map((option) => (
                <li key={option.id} onClick={() => handleSelect(option)} className="autocomplete-item">
                  {option.name}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Autocomplete;