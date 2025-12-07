/**
 * useProducts Hook
 * 
 * Custom hook for product-related operations
 */

import { useEffect, useState, useMemo } from 'react';
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
    // Default to 8 items per page
    const limit = useMemo(() => {
        const urlLimit = parseInt(searchParams.get('limit'));
        return urlLimit || 8;
    }, [searchParams]);
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');

    // Set limit in URL if not present (only once on mount)
    useEffect(() => {
        if (!searchParams.get('limit')) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('limit', '8');
            setSearchParams(newParams, { replace: true });
        }
    }, []); // Empty dependency array - only run once

    // Load products based on URL params
    useEffect(() => {
        const loadProducts = () => {
            // If search query exists, search products
            if (search) {
                dispatch(searchProducts({ query: search, page, limit: limit || 8 }));
                return;
            }

            // If category ID exists, fetch by category
            if (categoryId) {
                dispatch(fetchProductsByCategory({ categoryId, page, limit: limit || 8 }));
                return;
            }

            // Otherwise, fetch all products with filters
            // Initially show all products, then apply filters if any are set
            // Don't include page and limit in filters - they're separate params
            const activeFilters = {};

            // Only apply filters if they are explicitly set (not empty/undefined)
            if (filters.type) {
                activeFilters.type = filters.type;
            }
            if (filters.category) {
                activeFilters.category = filters.category;
            }
            if (filters.minPrice) {
                activeFilters.minPrice = filters.minPrice;
            }
            if (filters.maxPrice) {
                activeFilters.maxPrice = filters.maxPrice;
            }
            // Only apply isFeatured filter if it's explicitly set to true
            // If undefined or false, show all products
            if (filters.isFeatured === true) {
                activeFilters.isFeatured = true;
            }
            if (filters.sortBy) {
                activeFilters.sortBy = filters.sortBy;
            }
            if (filters.sortOrder) {
                activeFilters.sortOrder = filters.sortOrder;
            }

            // Default to 8 items per page
            const finalLimit = limit || 8;
            dispatch(fetchProducts({ filters: activeFilters, page, limit: finalLimit }));
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

