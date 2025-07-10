import { MAXIMUM_TABLE_ROWS_PER_PAGE } from '../../../lib/constants.js';

export default function Pagination({ totalItems, currentPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / MAXIMUM_TABLE_ROWS_PER_PAGE);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    return (
        <div className="pagination-container">
            <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
            >
                Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
            >
                Next
            </button>
        </div>
    );
}