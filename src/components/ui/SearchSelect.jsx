import { useState, useEffect } from 'react';
import axios from "../../lib/contexts/axiosInstance";
import { API_BASE_URL } from "../../lib/constants";

const SearchSelect = ({ field, register, errors, setValue, disabled_fields, fieldName, defaultValue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isSelected, setIsSelected] = useState(false);  // Track if a username is selected

  // Set the initial value of searchQuery if it was already prefilled (i.e., user is editing)
  useEffect(() => {
    // If the field already has a value (for example, user is editing)
    if (field && fieldName && fieldName in register) {
      const initialUsername = defaultValue;  // Initial value from form state
      setSearchQuery(initialUsername);
    }
  }, [field, fieldName, register]);

  // Debounced API search
  useEffect(() => {
    if (isSelected) return;  // Skip search if a username is already selected

    if (searchQuery.length < 4) {
      setResults([]);
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);

    setDebounceTimer(
      setTimeout(() => {
        fetchSearchResults(searchQuery);
      }, 1000)
    );

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [searchQuery, isSelected]);  // Re-run effect only when searchQuery or isSelected changes

  const fetchSearchResults = async (query) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ad-users?search=${query}`);
      console.log('Search results:', response);
      setResults(response?.data?.body);
    } catch (error) {
      console.error('Error fetching search results', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setValue(fieldName, value, { shouldValidate: true });
    setIsSelected(false);  // Reset selection state when user types
  };

  const handleSelection = (username) => {
    setSearchQuery(username);
    setResults([]);
    setValue(fieldName, username, { shouldValidate: true });
    setIsSelected(true);  // Mark that a selection has been made
  };

  const validateUsername = (value) => {
    if (
        !results.some(user => user.username.toLowerCase().includes(value.toLowerCase()))
         && !isSelected
         && (defaultValue && value !== defaultValue)
    ) {
      return 'Выберите логин из результатов поиска. (минимум 4 символа)';
    }
    return true;
  };

  return (
    <div key={fieldName} className="edit-form-field" style={field.width ? { width: `calc(${field.width} - 14px)` } : {}}>
      <label>
        {field.label}
        {field.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <input
        type="text"
        disabled={disabled_fields.includes(field.label)}
        {...register(fieldName, {
          validate: validateUsername,
        })}
        onChange={handleInputChange}
        placeholder={`Введите ${field.label}`}
      />
      {errors[fieldName] && <p>{errors[fieldName].message}</p>}

      {isLoading && searchQuery.length >= 4 && (
        <p>Загрузка...</p>
      )}

      {results?.length > 0 && searchQuery.length >= 4 && !isSelected && (
        <ul className="search-results">
          {results.map((user) => (
            <li key={user.username} onClick={() => handleSelection(user.username)}>
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchSelect;
