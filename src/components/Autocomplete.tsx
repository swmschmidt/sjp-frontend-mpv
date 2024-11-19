import { useState } from "react";
import "../styles/autocomplete.css";

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

const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  onSelect,
  query,
  setQuery,
  placeholder,
  onToggleList,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (option: Option) => {
    setQuery(option.name);
    setShowDropdown(false);
    onSelect(option); // Pass selected option to the parent
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length >= 3); // Show dropdown if query length >= 3
  };

  const handleToggleAllOptions = () => {
    if (!showDropdown) {
      setQuery(""); // Clear the query to display all options
      setShowDropdown(true); // Open dropdown
    }
    onToggleList(); // Notify parent to toggle list
  };

  return (
    <div className="autocomplete-wrapper">
      <button
        onClick={handleToggleAllOptions}
        className="list-toggle-button"
        title={placeholder.includes("medicamento") ? "Ver todos os medicamentos" : "Ver todas as unidades"}
      >
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
              .filter((option) => query ? option.name.toLowerCase().includes(query.toLowerCase()) : true)
              .map((option) => (
                <li
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className="autocomplete-item"
                >
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
