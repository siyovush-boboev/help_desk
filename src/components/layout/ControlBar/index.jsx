import { useState } from "react";
import { FiltersIcon, PlusIcon, TrashIcon } from "../../ui/icons";

export default function ControlBar({
    showSearch = false,
    showDelete = false,
    showFilters = false,
    showShowHide = false,
    showCreate = false,
    onDelete = () => console.log("Delete clicked"),
    onFilter = () => console.log("Filter clicked"),
    onCreate = () => console.log("Create clicked"),
}) {
    const [searchValue, setSearchValue] = useState("");
    const [showClear, setShowClear] = useState(false);
    const [showClosed, setShowClosed] = useState(false);

    const handleSearchKeyDown = (e) => {
        setShowClear(true);
        if (e.key === "Enter") {
            console.log(`Searching for: ${searchValue}`);
        }
    };

    const toggleShowClosed = () => {
        setShowClosed((prev) => !prev);
        const status_column_index = [...document.querySelectorAll(".custom-table thead th")].find(el => el.textContent == "Статус")?.cellIndex;
        if (status_column_index) {
            const rows = document.querySelectorAll(".custom-table tbody tr");
            rows.forEach(row => {
                const statusCell = row.cells[status_column_index];
                if (statusCell)
                    row.style.display = !showClosed || statusCell.textContent !== "Закрыто" ? "" : "none";
            });
        }
        console.log(`Toggle closed rows: ${!showClosed}`);
    };

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
                    {showClear && (
                        <button
                            id="clear-button"
                            onClick={() => {
                                setSearchValue("");
                                setShowClear(false);
                            }}
                        >
                            ❌
                        </button>
                    )}
                </div>
            )}

            {showDelete && (
                <button id="delete_button" onClick={onDelete}>
                    <span>
                        <TrashIcon />
                    </span>
                    &nbsp;Удалить
                </button>
            )}

            {showFilters && (
                <button onClick={onFilter}>
                    <span>
                        <FiltersIcon />
                    </span>
                    &nbsp;Фильтры
                </button>
            )}

            {showShowHide && (
                <button onClick={toggleShowClosed}>
                    {showClosed ? "Скрыть закрытые" : "Показать закрытые"}
                </button>
            )}

            {showCreate && (
                <button id="create_button" onClick={onCreate}>
                    <span>
                        <PlusIcon />
                    </span>
                    &nbsp;Создать
                </button>
            )}
        </div>
    );
}
