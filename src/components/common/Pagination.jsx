/**
 * Pagination Component
 * 
 * Reusable pagination component for displaying paginated data.
 * Supports page navigation, page size selection, and shows current page info.
 */

import { useTranslation } from 'react-i18next';

/**
 * Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Items per page
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onItemsPerPageChange - Callback when items per page changes
 */
function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 12,
    onPageChange,
    onItemsPerPageChange,
}) {
    const { t } = useTranslation();

    // Calculate page range to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total pages is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show pages around current page
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            // Adjust if we're near the end
            if (endPage - startPage < maxPagesToShow - 1) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange?.(page);
        }
    };

    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = parseInt(e.target.value);
        onItemsPerPageChange?.(newItemsPerPage);
    };

    if (totalPages <= 1 && !onItemsPerPageChange) {
        return null; // Don't show pagination if only one page
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            {/* Items per page selector */}
            {onItemsPerPageChange && (
                <div className="flex items-center gap-2">
                    <label className="text-sm text-base-content/70">
                        {t('common.itemsPerPage') || 'Items per page:'}
                    </label>
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="select select-bordered select-sm"
                    >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                        <option value={96}>96</option>
                    </select>
                </div>
            )}

            {/* Page info */}
            <div className="text-sm text-base-content/70">
                {t('common.showing') || 'Showing'} {startItem} - {endItem} {t('common.of') || 'of'} {totalItems}
            </div>

            {/* Pagination buttons */}
            <div className="join">
                {/* First page */}
                <button
                    className="join-item btn btn-sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                >
                    ««
                </button>

                {/* Previous page */}
                <button
                    className="join-item btn btn-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    «
                </button>

                {/* Page numbers */}
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        className={`join-item btn btn-sm ${page === currentPage ? 'btn-active' : ''
                            }`}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                {/* Next page */}
                <button
                    className="join-item btn btn-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    »
                </button>

                {/* Last page */}
                <button
                    className="join-item btn btn-sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    »»
                </button>
            </div>
        </div>
    );
}

export default Pagination;

