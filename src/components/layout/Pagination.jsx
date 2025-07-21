import { useState, useEffect } from "react";

export default function Pagination({
    totalItems,
    pageSizeOptions = [5, 10, 15, 20, 25, 30],
    initialPageSize = 10,
    currentPage = 1,
    totalPages = 1,
    onPageChange = () => { },
    onPageSizeChange = () => { },
}) {
    const [page, setPage] = useState(currentPage);
    const [size, setSize] = useState(initialPageSize);
    const [inputVal, setInputVal] = useState(currentPage);

    // sync external page changes
    useEffect(() => {
        setPage(currentPage);
        setInputVal(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
            setInputVal(newPage);
            onPageChange(newPage);
        }
    };

    const handleSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        if (!isNaN(newSize) && newSize !== size) {
            setSize(newSize);
            onPageSizeChange(newSize);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputVal(val);
    };

    const handleInputBlur = () => {
        const num = parseInt(inputVal, 10);
        if (!isNaN(num)) {
            handlePageChange(num);
        } else {
            setInputVal(page); // reset if invalid
        }
    };

    return (
        <div className="pagination-container">
            {/* Info Div */}
            <div>
                <span>Всего записей: {totalItems}</span>
                <span>
                    &nbsp;| Показывать по:&nbsp;
                    <select id="rows-per-page" value={size} onChange={handleSizeChange}>
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </span>
            </div>

            {/* Nav Div */}
            <div>
                <button
                    id="prev-table-page-btn"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    ←
                </button>

                <span id="page-info">
                    Страница&nbsp;
                    <input
                        type="text"
                        value={inputVal}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        min={1}
                        max={totalPages}
                    />
                    &nbsp;из {totalPages}
                </span>

                <button
                    id="next-table-page-btn"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                >
                    →
                </button>
            </div>
        </div>
    );
}
