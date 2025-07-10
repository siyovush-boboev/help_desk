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

    useEffect(() => {
        setPage(currentPage);
    }, [currentPage]);

    const handlePrev = () => {
        if (page > 1) {
            const newPage = page - 1;
            setPage(newPage);
            onPageChange(newPage);
        }
    };

    const handleNext = () => {
        if (page < totalPages) {
            const newPage = page + 1;
            setPage(newPage);
            onPageChange(newPage);
        }
    };

    const handleSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        setSize(newSize);
        onPageSizeChange(newSize);
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
                    onClick={handlePrev}
                    disabled={page === 1}
                >
                    ←
                </button>
                <span id="page-info">
                    Страница {page} из {totalPages}
                </span>
                <button
                    id="next-table-page-btn"
                    onClick={handleNext}
                    disabled={page === totalPages}
                >
                    →
                </button>
            </div>
        </div>
    );
}
