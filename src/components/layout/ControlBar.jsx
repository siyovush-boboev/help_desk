import { useState, useEffect } from "react";
import { FiltersIcon, PlusIcon, TrashIcon, ClearIcon } from "../ui/icons";

export default function ControlBar({
    showSearch = false,
    showDelete = false,
    showCreate = false,
    showFilters = false,
    showShowHide = false,
    initialSearchValue = "",
    showClosed,
    setShowClosed,
    onDelete,
    onFilter,
    onCreate,
    onSearch,
    equipmentProps = [{}, {}, () => { }],
    createdOrdersProps = [{}, () => { }],
    refk = () => { },
}) {
    const [searchValue, setSearchValue] = useState(initialSearchValue);
    const [showClear, setShowClear] = useState(false);

    let [equipmentTypes, filtersFromUrl, onFilterApply] = equipmentProps;
    if (Object.keys(createdOrdersProps).length > 0){
        [filtersFromUrl, onFilterApply] = createdOrdersProps;
    }

    useEffect(() => {
        setSearchValue(initialSearchValue);
        setShowClear(initialSearchValue.length > 0);
    }, [initialSearchValue]);

    const handleSearchKeyDown = (e) => { setShowClear(true); if (e.key === "Enter") onSearch(searchValue.trim()); };
    const toggleShowClosed = () => setShowClosed((prev) => !prev);
    const onClearSearch = () => { setSearchValue(""); setShowClear(false); onSearch(""); }

    return (
        <div className="controls">
            {showSearch && (
                <div className="search-container">
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Поиск"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    {showClear &&
                        <button id="clear-button" onClick={onClearSearch}>
                            <ClearIcon />
                        </button>}
                </div>
            )}

            {showDelete && (
                <button id="delete_button" onClick={onDelete}>
                    <span><TrashIcon /></span>&nbsp;Удалить
                </button>
            )}

            {showFilters && (
                <button onClick={onFilter}>
                    <span><FiltersIcon /></span>&nbsp;Фильтры
                </button>
            )}

            <button onClick={() => refk(prev => prev + 1)}>Обновить данные</button>

            {Object.keys(equipmentTypes).length > 0 && (
                <select
                    id="equipment-type-filter"
                    onChange={(e) => {
                        const new_val = e.target.value;
                        const new_filters = { ...filtersFromUrl };
                        if (new_val) new_filters["equipment_type_id"] = [new_val];
                        else delete new_filters["equipment_type_id"];
                        onFilterApply(new_filters);
                    }}
                    value={filtersFromUrl["equipment_type_id"] ? filtersFromUrl["equipment_type_id"][0] : ""}
                >
                    <option value="">Все типы оборудования</option>
                    {Object.entries(equipmentTypes).map(([key, type]) => (
                        <option key={key} value={key}>{type.name}</option>
                    ))}
                </select>
            )}

            {Object.keys(createdOrdersProps[0]).length > 0 && (
                <button onClick={
                    () => {
                        const new_filters = { ...filtersFromUrl };
                        if (new_filters["participant"]){
                            delete new_filters["participant"];
                            new_filters["assigned"] = "me";
                        } else {
                            delete new_filters["assigned"];
                            new_filters["participant"] = "me";
                        }
                        onFilterApply(new_filters);
                    }
                }>
                    {filtersFromUrl["assigned"] ? "Созданные мной" : "Назначенные мне"}
                </button>
            )}

            {showShowHide && (
                <button onClick={toggleShowClosed}>
                    {showClosed ? "Скрыть закрытые" : "Показать закрытые"}
                </button>
            )}

            {showCreate && (
                <button id="create_button" onClick={onCreate}>
                    <span><PlusIcon /></span>&nbsp;Создать
                </button>
            )}
        </div>
    );
}
