/**
 * useProducts Hook
 * 
 * Custom hook for product-related operations
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
    fetchProducts,
    fetchProductsByCategory,
    searchProducts,
    selectProducts,
    selectFilters,
    selectSearchQuery,
    selectPagination,
    selectIsLoading,
    selectIsSearching,
    selectError,
    setFilters,
    clearFilters,
} from '../store/slices/productSlice';
import { PAGINATION } from '../utils/constants';

export const useProducts = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid');

    // Redux state
    const products = useSelector(selectProducts);
    const filters = useSelector(selectFilters);
    const searchQuery = useSelector(selectSearchQuery);
    const pagination = useSelector(selectPagination);
    const isLoading = useSelector(selectIsLoading);
    const isSearching = useSelector(selectIsSearching);
    const error = useSelector(selectError);

    // Get params from URL
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || PAGINATION.DEFAULT_LIMIT;
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');

    // Load products based on URL params
    useEffect(() => {
        const loadProducts = () => {
            // If search query exists, search products
            if (search) {
                dispatch(searchProducts({ query: search, page, limit }));
                return;
            }

            // If category ID exists, fetch by category
            if (categoryId) {
                dispatch(fetchProductsByCategory({ categoryId, page, limit }));
                return;
            }

            // Otherwise, fetch all products with filters
            const activeFilters = {
                ...filters,
                page,
                limit,
            };
            dispatch(fetchProducts({ filters: activeFilters, page, limit }));
        };

        loadProducts();
    }, [dispatch, page, limit, categoryId, search, filters.type, filters.category, filters.minPrice, filters.maxPrice, filters.isFeatured, filters.sortBy, filters.sortOrder]);

    // Update URL params when filters change
    const updateFilters = (newFilters) => {
        dispatch(setFilters(newFilters));
        // Reset to page 1 when filters change
        setSearchParams({ ...searchParams, page: 1 });
    };

    // Clear all filters
    const clearAllFilters = () => {
        dispatch(clearFilters());
        setSearchParams({});
    };

    // Change page
    const changePage = (newPage) => {
        setSearchParams({ ...searchParams, page: newPage });
    };

    // Change items per page
    const changeItemsPerPage = (newLimit) => {
        setSearchParams({ ...searchParams, page: 1, limit: newLimit });
    };

    // Search products
    const handleSearch = (query) => {
        if (query.trim()) {
            setSearchParams({ search: query, page: 1 });
        } else {
            const newParams = { ...searchParams };
            newParams.delete('search');
            setSearchParams(newParams);
        }
    };

    return {
        products,
        filters,
        searchQuery,
        pagination,
        isLoading: isLoading || isSearching,
        error,
        viewMode,
        setViewMode,
        updateFilters,
        clearAllFilters,
        changePage,
        changeItemsPerPage,
        handleSearch,
    };
};

