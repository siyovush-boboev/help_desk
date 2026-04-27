import { useState, useEffect } from "react";
import { FiltersIcon, PlusIcon, TrashIcon, ClearIcon } from "../ui/icons";

export default function ControlBar({
    showSearch = false,
    showDelete = false,
    showCreate = false,
    showFilters = false,
    showShowHide = false,
    showPeriodSelector = false,
    extraButtons = null,
    initialSearchValue = "",
    showClosed,
    setShowClosed,
    onDelete,
    onFilter,
    onCreate,
    onSearch,
    equipmentProps = [{}, {}, () => { }],
    createdOrdersProps = [{}, () => { }],
    periodProps = [{}, () => { }],
    refk = () => { },
}) {
    const [searchValue, setSearchValue] = useState(initialSearchValue);
    const [showClear, setShowClear] = useState(false);
    const [selectedOrderFilter, setSelectedOrderFilter] = useState("created");
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [tempCustomDateFrom, setTempCustomDateFrom] = useState("");
    const [tempCustomDateTo, setTempCustomDateTo] = useState("");

    let [equipmentTypes, filtersFromUrl, onFilterApply] = equipmentProps;
    let [periodFilters, onPeriodApply] = periodProps;
    if (Object.keys(createdOrdersProps?.[0] || {}).length > 0){
        [filtersFromUrl, onFilterApply] = createdOrdersProps;
    }

    // Sync the selected filter with URL params
    useEffect(() => {
        if (Object.keys(createdOrdersProps[0]).length > 0) {
            const filter = filtersFromUrl["created"] ? "created" : 
                          filtersFromUrl["assigned"] ? "assigned" : 
                          filtersFromUrl["involved"] ? "involved" : "created";
            setSelectedOrderFilter(filter);
        }
    }, [filtersFromUrl, createdOrdersProps]);

    // Sync period selector with URL params
    useEffect(() => {
        if (showPeriodSelector && periodFilters) {
            const period = periodFilters["period"] || "month";
            const dateFrom = periodFilters["date_from"] || "";
            const dateTo = periodFilters["date_to"] || "";
            
            setSelectedPeriod(period);
            setTempCustomDateFrom(dateFrom);
            setTempCustomDateTo(dateTo);
        }
    }, [periodFilters, showPeriodSelector]);

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

            {extraButtons}

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
                <select
                    className="orders-filter-select"
                    onChange={(e) => {
                        const filterType = e.target.value;
                        const new_filters = { ...filtersFromUrl };
                        delete new_filters["created"];
                        delete new_filters["assigned"];
                        delete new_filters["involved"];
                        
                        if (filterType === "created") {
                            new_filters["created"] = "me";
                        } else if (filterType === "assigned") {
                            new_filters["assigned"] = "me";
                        } else if (filterType === "involved") {
                            new_filters["involved"] = "me";
                        }
                        setSelectedOrderFilter(filterType);
                        onFilterApply(new_filters);
                    }}
                    value={selectedOrderFilter}
                >
                    <option value="created">Созданные мной</option>
                    <option value="assigned">Назначенные мне</option>
                    <option value="involved">Участвовал</option>
                </select>
            )}

            {showPeriodSelector && (
                <div className="period-selector-container">
                    <select
                        className="period-select"
                        onChange={(e) => {
                            const period = e.target.value;
                            setSelectedPeriod(period);
                            
                            if (period !== "custom") {
                                // For preset periods, only send period parameter
                                const newFilters = {
                                    period: period,
                                    date_from: null,
                                    date_to: null
                                };
                                onPeriodApply(newFilters);
                            }
                            // For custom period, don't call API yet - wait for user to select dates
                        }}
                        value={selectedPeriod}
                    >
                        <option value="today">Сегодня</option>
                        <option value="7d">7 дней</option>
                        <option value="14d">14 дней</option>
                        <option value="30d">30 дней</option>
                        <option value="month">Месяц</option>
                        <option value="custom">Произвольный</option>
                    </select>
                    
                    {selectedPeriod === "custom" && (
                        <div className="custom-date-inputs">
                            <input
                                type="date"
                                placeholder="Дата от"
                                value={tempCustomDateFrom}
                                max={tempCustomDateTo || new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setTempCustomDateFrom(e.target.value);
                                }}
                            />
                            <input
                                type="date"
                                placeholder="Дата до"
                                value={tempCustomDateTo}
                                min={tempCustomDateFrom}
                                onChange={(e) => {
                                    setTempCustomDateTo(e.target.value);
                                }}
                            />
                            <button
                                className="custom-period-apply-btn"
                                onClick={() => {
                                    if (tempCustomDateFrom) {
                                        const today = new Date().toISOString().split('T')[0];
                                        const endDate = tempCustomDateTo || today;
                                        
                                        const newFilters = {
                                            period: "custom",
                                            date_from: tempCustomDateFrom,
                                            date_to: endDate
                                        };
                                        onPeriodApply(newFilters);
                                    }
                                }}
                                disabled={!tempCustomDateFrom}
                            >
                                Применить
                            </button>
                            <button
                                className="custom-period-reset-btn"
                                onClick={() => {
                                    setTempCustomDateFrom("");
                                    setTempCustomDateTo("");
                                }}
                            >
                                Отмена
                            </button>
                        </div>
                    )}
                </div>
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
