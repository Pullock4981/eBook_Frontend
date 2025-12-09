/**
 * Product Search Component
 * 
 * Search bar for products with debounced search
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setSearchQuery, searchProducts } from '../../store/slices/productSlice';
import { debounce } from '../../utils/helpers';
import { useThemeColors } from '../../hooks/useThemeColors';

function ProductSearch({ onSearch }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const [searchTerm, setSearchTerm] = useState('');

    // Debounced search function
    const debouncedSearch = debounce((query) => {
        if (query.trim()) {
            dispatch(setSearchQuery(query));
            dispatch(searchProducts({ query, page: 1, limit: 12 }));
            if (onSearch) onSearch(query);
        } else {
            dispatch(setSearchQuery(''));
        }
    }, 500);

    // Handle input change
    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Clear search
    const handleClear = () => {
        setSearchTerm('');
        dispatch(setSearchQuery(''));
        if (onSearch) onSearch('');
    };

    return (
        <div className="form-control w-full">
            <div className="relative">
                <input
                    type="text"
                    placeholder={t('products.searchPlaceholder') || 'Search products...'}
                    className="input input-bordered w-full pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm sm:text-base"
                    value={searchTerm}
                    onChange={handleChange}
                    style={{
                        borderColor: secondaryTextColor,
                        color: primaryTextColor,
                        backgroundColor
                    }}
                />
                {/* Search Icon */}
                <svg
                    className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: secondaryTextColor }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                {/* Clear Button */}
                {searchTerm && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle p-1"
                        style={{ color: secondaryTextColor }}
                        aria-label="Clear search"
                    >
                        <svg
                            className="w-3 h-3 sm:w-4 sm:h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

export default ProductSearch;

