import { useState, useEffect, useCallback, useRef } from "react";
import { DEPENDANT_FIELDS } from "../../lib/pages";
import { priority_colors, BASE_URL } from "../../lib/constants";
import { OrderIcon } from "../ui/icons";

export default function FiltersModal({ filters, preload, defaultFilters, onApply, onClose }) {
    const [selectedValues, setSelectedValues] = useState(defaultFilters || {});
    const [filteredOptions, setFilteredOptions] = useState({});
    const [openDropdowns, setOpenDropdowns] = useState({});
    const modalRef = useRef(null);  // Reference to the modal container

    // To track individual dropdown options
    const dropdownRefs = useRef({});

    useEffect(() => {
        const newFilteredOptions = {};

        filters.forEach(filter => {
            const parentField = Object.entries(DEPENDANT_FIELDS.desc).find(([, children]) =>
                children.includes(filter.id)
            )?.[0];

            let allOptions =
                (filter.label === "Заявитель" || filter.label === "Исполнитель")
                    ? preload["Пользователь"] || {}
                    : preload[filter.label] || {};

            let filtered = Object.entries(allOptions);
            if (parentField && selectedValues[parentField]?.length > 0) {
                const parentSelected = selectedValues[parentField].map(id => Number(id));
                filtered = filtered.filter(([, value]) =>
                    parentSelected.includes(value[parentField])
                );

                const selectedInThisField = selectedValues[filter.id] || [];
                const missingSelected = selectedInThisField.filter(
                    key => !filtered.some(([k]) => k === key) && allOptions[key]
                );
                const missingEntries = missingSelected.map(key => [key, allOptions[key]]);
                filtered = [...filtered, ...missingEntries];
            }

            newFilteredOptions[filter.id] = Object.fromEntries(filtered);
        });

        setFilteredOptions(newFilteredOptions);
    }, [selectedValues, filters, preload]);

    const toggleDropdown = (filterId) => {
        setOpenDropdowns(prev => {
            const isCurrentlyOpen = !!prev[filterId];
            // Close all dropdowns, then open the selected one if it wasn't already open
            return isCurrentlyOpen ? {} : { [filterId]: true };
        });
    };

    const handleCheckboxChange = useCallback((filterId, val) => {
        setSelectedValues(prev => {
            const prevVals = new Set(prev[filterId] || []);
            if (prevVals.has(val)) prevVals.delete(val);
            else prevVals.add(val);
            return { ...prev, [filterId]: Array.from(prevVals) };
        });
    }, []);

    const handleApply = useCallback((e) => {
        e.stopPropagation();
        onApply(selectedValues);
        onClose();
    }, [onApply, onClose, selectedValues]);

    const resetFilters = useCallback(() => setSelectedValues({}), []);

    // Close dropdowns when clicking outside of the dropdown and options container
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                // Check if the click is outside the modal or the specific dropdown's options container
                const isOutsideDropdown = Object.values(dropdownRefs.current).every(ref => ref && !ref.contains(e.target));
                if (isOutsideDropdown) {
                    setOpenDropdowns({});
                }
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="form-container" ref={modalRef}>
            <div>
                <p><OrderIcon />Фильтры</p>
                <div className="filters-list">
                    {filters.map((filter) => {
                        const options = filteredOptions[filter.id]
                            || preload[filter.label.replace("Заявитель", "Пользователь").replace("Исполнитель", "Пользователь")]
                            || {};
                        const selected = selectedValues[filter.id] || [];

                        return (
                            <div className="filter-dropdown" key={filter.id}>
                                <div className="dropdown-header" onClick={() => toggleDropdown(filter.id)}>
                                    <span>{filter.label}</span>
                                    <span className="dropdown-arrow">{openDropdowns[filter.id] ? "▲" : "▼"}</span>
                                </div>
                                {openDropdowns[filter.id] && (
                                    <div
                                        ref={el => dropdownRefs.current[filter.id] = el} // Set reference for the options container
                                        className="dropdown-options"
                                    >
                                        {Object.entries(options).map(([key, value]) => (
                                            <label key={key} className="dropdown-option" style={filter.label === "Приоритет" ? { color: priority_colors[value.name] || 'inherit' } : {}}>
                                                <input
                                                    type="checkbox"
                                                    value={key}
                                                    checked={selected.includes(key)}
                                                    onChange={() => handleCheckboxChange(filter.id, key)}
                                                />
                                                {filter.label === "Статус" && 
                                                    <img src={BASE_URL + value?.["icon_small"]} alt="" className="status-icon"></img>
                                                }
                                                <span>{["Привелигия"].includes(filter.label) ? value.description : value.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
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
        </div>
    );
}
