import { useState, useEffect } from "react";
import { FiltersIcon, PlusIcon, TrashIcon } from "../ui/icons";

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
}) {
    const [searchValue, setSearchValue] = useState(initialSearchValue);
    const [showClear, setShowClear] = useState(false);

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
                        type="text"
                        placeholder="🔍 Поиск"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    {showClear && <button id="clear-button" onClick={onClearSearch}>❌</button>}
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
