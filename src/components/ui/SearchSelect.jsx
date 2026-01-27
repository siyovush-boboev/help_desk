import { useState, useEffect } from 'react';
import axios from "../../lib/contexts/axiosInstance";
import { API_BASE_URL } from "../../lib/constants";


const fieldData = {
  username: {
    url: "/ad-users?",
    propname: "username",
  },
  executor_id: {
    url: "/user?",
    propname: "fio",
  },
}


function getProperty(obj, propName) {
  return obj[propName];
}


function getURL(field_name, params = {}) {
  let url = `${API_BASE_URL}`;

  url += fieldData?.[field_name]?.url || "";

  if (Object.keys(params).length === 0)
    return url;

  for (const [key, value] of Object.entries(params)) {
    url += `${key}=${value}&`;
  }
  return url.slice(0, -1);
}


function ParseResults({ results, field_name, handler }) {
  let propName = fieldData?.[field_name]?.propname;
  if (!propName)
    return;
  return (<>
    {results.map((item) => (
      <li key={getProperty(item, propName)} onClick={() => handler(getProperty(item, propName))}>
        {getProperty(item, propName)}
      </li>
    ))}
  </>);
}


const SearchSelect = ({ field, register, errors, setErrors, setValue, disabled_fields, fieldName, defaultValue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isSelected, setIsSelected] = useState(false);  // Track if a value is selected

  // Set the initial value of searchQuery if it was already prefilled (i.e., user is editing)
  useEffect(() => {
    // If the field already has a value (for example, user is editing)
    if (field && fieldName && fieldName in register) {
      const initialUsername = defaultValue;  // Initial value from form state
      setSearchQuery(initialUsername);
    }
  }, [field, fieldName, register, defaultValue]);

  // Debounced API search
  useEffect(() => {
    if (isSelected) return;  // Skip search if a value is already selected

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
      const response = await axios.get(getURL(fieldName, { search: query }));
      setResults(response?.data?.body);
    } catch (error) {
      console.error('Error fetching search results', error);
      setErrors(error?.response?.data?.message || 'Ошибка при отправке поискового запроса');
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

  const handleSelection = (value) => {
    setSearchQuery(value);
    setResults([]);
    setValue(fieldName, value, { shouldValidate: true });
    setIsSelected(true);  // Mark that a selection has been made
  };

  const validateUsername = (value) => {
    if (
      !results.some(item => item[fieldData?.[fieldName]?.propname].toLowerCase().includes(value.toLowerCase()))
      && !isSelected
      && (defaultValue && value !== defaultValue)
    ) {
      return 'Выберите из результатов поиска';
    }
    return true;
  };

  return (
    <>
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
        placeholder={"Введите минимум 4 символа"}
      />
      {errors[fieldName] && <p>{errors[fieldName].message}</p>}

      {isLoading && searchQuery.length >= 4 && (
        <p>Загрузка...</p>
      )}

      {results?.length > 0 && searchQuery.length >= 4 && !isSelected && (
        <ul className="search-results">
          <ParseResults
            results={results}
            field_name={fieldName}
            handler={handleSelection}
          />
        </ul>
      )}

    </>
  );
};

export default SearchSelect;
