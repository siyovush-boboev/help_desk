import { useState, useEffect, useCallback } from "react";
import { DEPENDANT_FIELDS } from "../../lib/pages";

const admin_roles = [
    "admin",
    "administrator",
    "superadmin",
    "super admin",
    "super-admin",
    "админ",
    "администратор",
    "суперадмин",
    "супер админ",
    "супер-админ",
    "суперадминистратор",
    "супер администратор"
];
const executor_roles = [
    "user",
    "executor",
    "исполнитель",
    "пользователь",
    "руководитель"
];

export default function FiltersModal({ filters, preload, defaultFilters, onApply, onClose }) {
    const [selectedValues, setSelectedValues] = useState(defaultFilters || {});
    const [filteredOptions, setFilteredOptions] = useState({});

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

            if (filter.label === "Заявитель" || filter.label === "Исполнитель") {
                const allUsers = preload["Пользователь"] || {};

                const adminIds = Object.values(allUsers)
                    .filter(u => admin_roles.includes(u.role_name?.toLowerCase()))
                    .map(u => u.id);

                const executorIds = Object.values(allUsers)
                    .filter(u => executor_roles.includes(u.role_name?.toLowerCase()))
                    .map(u => u.id);

                const limitToAdmins = filter.label === "Заявитель";
                allOptions = Object.fromEntries(
                    Object.entries(allUsers).filter(([, user]) =>
                        limitToAdmins ? adminIds.includes(user.id) : executorIds.includes(user.id)
                    )
                );
            }

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

    return (
        <div className="modal-form">
            <p>Фильтры</p>
            <div className="filters-list">
                {filters.map((filter, index) => {
                    const options = filteredOptions[filter.id]
                        || preload[filter.label.replace("Заявитель", "Пользователь").replace("Исполнитель", "Пользователь")]
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
