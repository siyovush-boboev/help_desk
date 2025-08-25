import { useState, useEffect, useMemo, useCallback } from "react";
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
    const permissions = useMemo(
        () => JSON.parse(localStorage.getItem("permissions")) || [],
        []
    );

    // 🔒 freeze filters + preload into stable memos
    const normalizedPreload = useMemo(() => {
        const copy = structuredClone(preload); // deep copy → stable reference
        filters.forEach(filter => {
            if (filter.options) {
                copy[filter.label] = filter.options.reduce((acc, item, index) => {
                    acc[index] = item;
                    return acc;
                }, {});
            }
        });
        return copy;
    }, [preload, filters]);

    const normalizedFilters = useMemo(() => {
        let f = [...filters];
        if (!permissions.includes("orders:create")) {  // non-admin user
            const fieldsToRemove = ["department_id", "otdel_id"];
            f = f.filter(filter => !fieldsToRemove.includes(filter.id));
        }
        return f;
    }, [filters, permissions]);

    useEffect(() => {
        // console.log("effect running"); // debug if u want
        const newFilteredOptions = {};

        normalizedFilters.forEach(filter => {
            const parentField = Object.entries(DEPENDANT_FIELDS.desc).find(([, children]) =>
                children.includes(filter.id)
            )?.[0];

            let allOptions =
                (filter.label === "Заявитель" || filter.label === "Исполнитель")
                    ? normalizedPreload["Пользователь"] || {}
                    : normalizedPreload[filter.label] || {};

            if (filter.label === "Заявитель" || filter.label === "Исполнитель") {
                const allUsers = normalizedPreload["Пользователь"] || {};
                console.log("all users:", allUsers);

                const adminIds = Object.values(allUsers)
                    .filter(u => admin_roles.includes(u.role_name?.toLowerCase()))
                    .map(u => u.id);

                const executorIds = Object.values(allUsers)
                    .filter(u => executor_roles.includes(u.role_name?.toLowerCase()))
                    .map(u => u.id);

                console.log(adminIds, executorIds);

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
    }, [selectedValues, normalizedFilters, normalizedPreload]);

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
                {normalizedFilters.map((filter, index) => {
                    const options = filteredOptions[filter.id]
                        || normalizedPreload[filter.label.replace("Заявитель", "Пользователь").replace("Исполнитель", "Пользователь")]
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
