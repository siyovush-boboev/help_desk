import { useContext } from 'react';
import { AuthContext } from '../contexts/authBS.js';
import { fetcher } from "../services/api/httpClient";


// Hook to use auth context anywhere
export function useAuth() {
  return useContext(AuthContext);
}

export function navbarClickHandler(e) {
  e.stopPropagation();
  const nav = document.querySelector('nav');
  const target = e.target.closest('a');
  const dropdownToggler = e.target.closest('.dropdown-container');

  // Mark the clicked link as active
  document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
  if (target)
    target.classList.add('active');

  if (dropdownToggler && !target) {
    // select all the dropdown links that are not inside a dropdown container
    const links = dropdownToggler.querySelectorAll(':scope > .dropdown-link');
    // Toggle the display mode for dropdown links
    let dropdownModeToSet = links[0].style.display === 'block' ? 'none' : 'block';
    // Apply the new display mode to each dropdown link
    links.forEach(link => {
      link.style.display = dropdownModeToSet;
    });
    // Update the arrow indicator to reflect the dropdown's open/closed state
    const arrow = dropdownToggler.querySelector('p');
    if (arrow) {
      arrow.textContent = arrow.textContent.slice(0, -1) + (dropdownModeToSet === 'block' ? '▲' : '▼');
    }
  }
  else
    // Close the nav if it is open
    nav.style.left = '-1000px';
}

export const loadData = async (setData, setPreload, setLoading, setError, API_RESOURCES, TABLE_PAGES_CONFIG, config) => {
    try {
        // Main table data
        const mainRes = await fetcher({
            url: API_RESOURCES[config.resource],
        });

        // Preload data for selects etc.
        const preloadResults = await Promise.all(
            config.preload.map((key) =>
                fetcher({ url: API_RESOURCES[key] })
            )
        );

        // ⚠️ Here we unwrap .result if your API returns { result: [...] }
        const preloadData = {};
        config.preload.forEach((key, i) => {
            key = TABLE_PAGES_CONFIG[key].singular || key; // Use singular form for keys
            const raw = preloadResults[i];
            // get raw["result"] and create an object with the key as raw[result][i][id] and value as the item's "name" or "title" or "fio" or just id itself
            const prepped = raw.result.reduce((acc, item) => {
                // Assuming each item has an "id" and a "name" or similar field
                const id = item.id || item._id || item.id || item.ID; // Adjust based on your API
                const name = item.name || item.title || item.fio || id; // Fallback to id if no name/title/fio
                acc[id] = name;
                return acc;
            }, {});
            // key should be the singular form ()
            preloadData[key] = prepped;
        });

        setData(mainRes);
        setPreload(preloadData);
    } catch (err) {
        console.error(err);
        setError("Ошибка загрузки данных");
    } finally {
        setLoading(false);
    }
};
