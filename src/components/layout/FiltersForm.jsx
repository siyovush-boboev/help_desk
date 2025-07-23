import { useState, useEffect } from "react";
import { DEPENDANT_FIELDS } from "../../lib/pages"; // 👈 same place as other file

export default function FiltersModal({ filters, preload, defaultFilters, onApply, onClose }) {
    const [selectedValues, setSelectedValues] = useState(defaultFilters || {});
    const [filteredOptions, setFilteredOptions] = useState({});

    useEffect(() => {
        const newFilteredOptions = {};

        filters.forEach(filter => {
            const parentField = Object.entries(DEPENDANT_FIELDS.desc).find(([, children]) =>
                children.includes(filter.id)
            )?.[0];

            if (parentField && selectedValues[parentField]?.length > 0) {
                const parentSelected = selectedValues[parentField].map(id => Number(id));
                const allOptions = preload[filter.label.replace("Заявитель", "Пользователь")] || {};

                const filtered = Object.entries(allOptions).filter(([, value]) => {
                    return parentSelected.includes(value[parentField]);
                });

                newFilteredOptions[filter.id] = Object.fromEntries(filtered);
            } else {
                newFilteredOptions[filter.id] = preload[filter.label.replace("Заявитель", "Пользователь")] || {};
            }
        });

        setFilteredOptions(newFilteredOptions);
    }, [selectedValues, filters, preload]);

    const handleCheckboxChange = (filterId, val) => {
        setSelectedValues(prev => {
            const prevVals = new Set(prev[filterId] || []);
            if (prevVals.has(val)) prevVals.delete(val);
            else prevVals.add(val);
            return { ...prev, [filterId]: Array.from(prevVals) };
        });
    };

    const handleApply = (e) => {
        e.stopPropagation();
        onApply(selectedValues);
        onClose();
    };

    const resetFilters = () => {
        setSelectedValues({});
    };

    return (
        <div className="modal-form">
            <p>Фильтры</p>
            <div className="filters-list">
                {filters.map((filter, index) => {
                    const options = filteredOptions[filter.id]
                        || preload[filter.label.replace("Заявитель", "Пользователь")]
                        || {};

                    return (
                        <div className="filter-options-list" key={`filter-${index}`} id={filter.id}>
                            <p>{filter.label}</p>
                            {Object.entries(options).map(([key, value]) => (
                                <label key={key}>
                                    <input
                                        type="checkbox"
                                        value={key}
                                        checked={selectedValues[filter.id]?.includes(key) || false}
                                        onChange={() => handleCheckboxChange(filter.id, key)}
                                    />
                                    {value.name}
                                </label>
                            ))}
                        </div>
                    );
                })}
            </div>
            <div className="modal-buttons">
                <button id="confirmBtn" onClick={handleApply}>Применить</button>
                <button id="cancelBtn" onClick={(e) => (e.stopPropagation(), onClose())}>Отмена</button>
                <button id="resetBtn" onClick={resetFilters}>Cбросить фильтры</button>
            </div>
        </div>
    );
}
