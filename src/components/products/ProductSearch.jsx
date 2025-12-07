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

function ProductSearch({ onSearch }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
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
                    className="input input-bordered w-full pl-10 pr-10"
                    value={searchTerm}
                    onChange={handleChange}
                    style={{
                        borderColor: '#e2e8f0',
                        color: '#1E293B',
                    }}
                />
                {/* Search Icon */}
                <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: '#1E293B' }}
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                        aria-label="Clear search"
                    >
                        <svg
                            className="w-4 h-4"
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

