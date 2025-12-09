/**
 * Pagination Component
 * 
 * Reusable pagination component for displaying paginated data.
 * Supports page navigation, page size selection, and shows current page info.
 */

import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../hooks/useThemeColors';

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
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();

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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mt-6 sm:mt-8 py-4 px-4 sm:px-6 rounded-lg border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
            {/* Items per page selector */}
            {onItemsPerPageChange && (
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                        {t('common.itemsPerPage') || 'Items per page:'}
                    </label>
                    <div className="relative">
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="appearance-none border-2 rounded-md pl-3 pr-8 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 cursor-pointer"
                            style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor }}
                        >
                            <option value={8}>8</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={48}>48</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2" style={{ color: secondaryTextColor }}>
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {/* Page info */}
            <div className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                {t('common.showing') || 'Showing'} <span style={{ color: primaryTextColor, fontWeight: '600' }}>{startItem}</span> - <span style={{ color: primaryTextColor, fontWeight: '600' }}>{endItem}</span> {t('common.of') || 'of'} <span style={{ color: primaryTextColor, fontWeight: '600' }}>{totalItems}</span>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-1">
                {/* First page */}
                <button
                    className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        color: currentPage === 1 ? secondaryTextColor : primaryTextColor,
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                            e.currentTarget.style.backgroundColor = 'rgba(107, 142, 107, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    title="First page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>

                {/* Previous page */}
                <button
                    className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        color: currentPage === 1 ? secondaryTextColor : primaryTextColor,
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                            e.currentTarget.style.backgroundColor = 'rgba(107, 142, 107, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Previous page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Page numbers */}
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        className="px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-200"
                        style={{
                            backgroundColor: page === currentPage ? buttonColor : 'transparent',
                            color: page === currentPage ? '#ffffff' : primaryTextColor,
                            fontWeight: page === currentPage ? '600' : '500'
                        }}
                        onMouseEnter={(e) => {
                            if (page !== currentPage) {
                                e.currentTarget.style.backgroundColor = 'rgba(107, 142, 107, 0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (page !== currentPage) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                {/* Next page */}
                <button
                    className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        color: currentPage === totalPages ? secondaryTextColor : primaryTextColor,
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        if (currentPage !== totalPages) {
                            e.currentTarget.style.backgroundColor = 'rgba(107, 142, 107, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Next page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Last page */}
                <button
                    className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        color: currentPage === totalPages ? secondaryTextColor : primaryTextColor,
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        if (currentPage !== totalPages) {
                            e.currentTarget.style.backgroundColor = 'rgba(107, 142, 107, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Last page"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default Pagination;

