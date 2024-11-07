import { useState, useEffect } from 'react';

interface Option {
  id: string;
  name: string;
}

interface AutocompleteProps {
  fetchOptions: () => Promise<Option[]>;
  onSelect: (option: Option) => void;
  placeholder: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ fetchOptions, onSelect, placeholder }) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchOptions().then(setOptions);
  }, [fetchOptions]);

  const handleSelect = (option: Option) => {
    setQuery(option.name);
    setShowDropdown(false); // Hide dropdown after selection
    onSelect(option);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length >= 3); // Show dropdown only if 3 or more characters
  };

  return (
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
  );
};

export default Autocomplete;
