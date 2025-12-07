/**
 * Product Slice
 * Redux slice for product state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productService from '../../services/productService';

// Async thunks
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async ({ filters = {}, page = 1, limit = 100 }, { rejectWithValue }) => {
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

export const fetchProductBySlug = createAsyncThunk(
    'products/fetchProductBySlug',
    async ({ slug, incrementViews = true }, { rejectWithValue }) => {
        try {
            const response = await productService.getProductBySlug(slug, incrementViews);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch product by slug');
        }
    }
);

export const searchProducts = createAsyncThunk(
    'products/searchProducts',
    async ({ query, page = 1, limit = 100 }, { rejectWithValue }) => {
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
    async ({ categoryId, page = 1, limit = 100 }, { rejectWithValue }) => {
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
        itemsPerPage: 8,
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
                // API interceptor returns response.data directly, so action.payload is the response object
                // Response structure: { success: true, data: [...], pagination: {...} }
                const responseData = action.payload;
                const products = responseData?.data || responseData || [];
                state.products = Array.isArray(products) ? products : [];
                state.pagination = responseData?.pagination || state.pagination;
                // Debug log in development
                if (import.meta.env.DEV) {
                    console.log('🔍 fetchProducts.fulfilled - Full payload:', action.payload);
                    console.log('🔍 fetchProducts.fulfilled - Products array:', products);
                    console.log('🔍 fetchProducts.fulfilled - Products count:', products.length);
                    console.log('🔍 fetchProducts.fulfilled - Pagination:', state.pagination);
                }
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
                // API interceptor returns response.data directly, so action.payload is the response object
                // Response structure: { success: true, data: {...} }
                const responseData = action.payload;
                state.currentProduct = responseData?.data || responseData || null;
                state.error = null;
                // Debug log in development
                if (import.meta.env.DEV) {
                    console.log('🔍 fetchProductById.fulfilled - Full payload:', action.payload);
                    console.log('🔍 fetchProductById.fulfilled - Product:', state.currentProduct);
                }
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || action.error?.message || 'Failed to fetch product';
                state.currentProduct = null;
                // Debug log in development
                if (import.meta.env.DEV) {
                    console.error('❌ fetchProductById.rejected - Error:', action.payload);
                    console.error('❌ fetchProductById.rejected - Full action:', action);
                }
            })
            // Fetch product by slug
            .addCase(fetchProductBySlug.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProductBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                // API interceptor returns response.data directly, so action.payload is the response object
                // Response structure: { success: true, data: {...} }
                const responseData = action.payload;
                state.currentProduct = responseData?.data || responseData || null;
                state.error = null;
                // Debug log in development
                if (import.meta.env.DEV) {
                    console.log('🔍 fetchProductBySlug.fulfilled - Full payload:', action.payload);
                    console.log('🔍 fetchProductBySlug.fulfilled - Product:', state.currentProduct);
                }
            })
            .addCase(fetchProductBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || action.error?.message || 'Failed to fetch product by slug';
                state.currentProduct = null;
                // Debug log in development
                if (import.meta.env.DEV) {
                    console.error('❌ fetchProductBySlug.rejected - Error:', action.payload);
                    console.error('❌ fetchProductBySlug.rejected - Full action:', action);
                }
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

