import { useState, useEffect } from "react";

export default function Pagination({
    totalItems = 0,
    pageSizeOptions = [5, 10, 20, 50, 100],
    limit = 20,
    currentPage = 1,
    totalPages = 1,
    onPageChange = () => { },
    onPageSizeChange = () => { },
}) {
    const [inputPage, setInputPage] = useState(currentPage);

    useEffect(() => {
        setInputPage(currentPage);
    }, [currentPage]);

    const handlePageChange = (shift) => {
        const newPage = currentPage + shift;
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value))
            setInputPage(value);
    };

    const handleInputBlurOrEnter = () => {
        const parsed = parseInt(inputPage, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages)
            onPageChange(parsed);
        else
            setInputPage(currentPage); // reset to legit page
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter")
            handleInputBlurOrEnter();
    };

    const handleSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        if (!isNaN(newSize) && newSize !== limit)
            onPageSizeChange(newSize);
    };

    return (
        <div className="pagination-container">
            <div>
                <span>Всего записей: {totalItems}</span>
                <span>
                    &nbsp;| Показывать по:&nbsp;
                    <select id="rows-per-page" value={limit} onChange={handleSizeChange} aria-label="Количество строк на странице">
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </span>
            </div>

            <div>
                <button
                    id="prev-table-page-btn"
                    onClick={() => handlePageChange(-1)}
                    disabled={currentPage === 1}
                >
                    ←
                </button>

                <span id="page-info">
                    Страница&nbsp;
                    <input
                        type="text"
                        value={inputPage}
                        onChange={handleInputChange}
                        onBlur={handleInputBlurOrEnter}
                        onKeyDown={handleKeyDown}
                        aria-label="Номер страницы"
                        style={{
                            width: "40px",
                            textAlign: "center",
                            marginRight: "4px",
                        }}
                    />
                    из {totalPages}
                </span>

                <button
                    id="next-table-page-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === totalPages}
                >
                    →
                </button>
            </div>
        </div>
    );
}
