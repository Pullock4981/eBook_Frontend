/**
 * Product Slice
 * Redux slice for product state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../../services/productService';

// Async thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async ({ filters = {}, page = 1, limit = 12 }, { rejectWithValue }) => {
        try {
            const response = await productService.getAllProducts(filters, page, limit);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch products');
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async ({ id, incrementViews = true }, { rejectWithValue }) => {
        try {
            const response = await productService.getProductById(id, incrementViews);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch product');
        }
    }
);

export const searchProducts = createAsyncThunk(
    'products/searchProducts',
    async ({ query, page = 1, limit = 12 }, { rejectWithValue }) => {
        try {
            const response = await productService.searchProducts(query, page, limit);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to search products');
        }
    }
);

export const fetchFeaturedProducts = createAsyncThunk(
    'products/fetchFeaturedProducts',
    async (limit = 10, { rejectWithValue }) => {
        try {
            const response = await productService.getFeaturedProducts(limit);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch featured products');
        }
    }
);

export const fetchProductsByCategory = createAsyncThunk(
    'products/fetchProductsByCategory',
    async ({ categoryId, page = 1, limit = 12 }, { rejectWithValue }) => {
        try {
            const response = await productService.getProductsByCategory(categoryId, page, limit);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch products by category');
        }
    }
);

// Initial state
const initialState = {
    products: [],
    currentProduct: null,
    featuredProducts: [],
    filters: {
        type: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        isFeatured: false,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    },
    searchQuery: '',
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12,
    },
    isLoading: false,
    isSearching: false,
    error: null,
};

// Create slice
const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        // Set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        // Clear filters
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        // Set search query
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        // Clear current product
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch products
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.data || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch product by ID
            .addCase(fetchProductById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProduct = action.payload.data || null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Search products
            .addCase(searchProducts.pending, (state) => {
                state.isSearching = true;
                state.error = null;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.isSearching = false;
                state.products = action.payload.data || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(searchProducts.rejected, (state, action) => {
                state.isSearching = false;
                state.error = action.payload;
            })
            // Fetch featured products
            .addCase(fetchFeaturedProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.featuredProducts = action.payload.data || [];
            })
            .addCase(fetchFeaturedProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch products by category
            .addCase(fetchProductsByCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.data || [];
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchProductsByCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

// Export actions
export const { setFilters, clearFilters, setSearchQuery, clearCurrentProduct, clearError } = productSlice.actions;

// Export selectors
export const selectProducts = (state) => state.products.products;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectFeaturedProducts = (state) => state.products.featuredProducts;
export const selectFilters = (state) => state.products.filters;
export const selectSearchQuery = (state) => state.products.searchQuery;
export const selectPagination = (state) => state.products.pagination;
export const selectIsLoading = (state) => state.products.isLoading;
export const selectIsSearching = (state) => state.products.isSearching;
export const selectError = (state) => state.products.error;

// Export reducer
export default productSlice.reducer;

