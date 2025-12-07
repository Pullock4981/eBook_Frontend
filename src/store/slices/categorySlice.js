/**
 * Category Slice
 * Redux slice for category state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryService from '../../services/categoryService';

// Async thunks
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await categoryService.getAllCategories();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch categories');
        }
    }
);

export const fetchMainCategories = createAsyncThunk(
    'categories/fetchMainCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await categoryService.getMainCategories();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch main categories');
        }
    }
);

export const fetchCategoryById = createAsyncThunk(
    'categories/fetchCategoryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await categoryService.getCategoryById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch category');
        }
    }
);

export const fetchSubcategories = createAsyncThunk(
    'categories/fetchSubcategories',
    async (parentId, { rejectWithValue }) => {
        try {
            const response = await categoryService.getSubcategories(parentId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch subcategories');
        }
    }
);

// Initial state
const initialState = {
    categories: [],
    mainCategories: [],
    currentCategory: null,
    subcategories: [],
    isLoading: false,
    error: null,
};

// Create slice
const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        // Clear current category
        clearCurrentCategory: (state) => {
            state.currentCategory = null;
            state.subcategories = [];
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all categories
            .addCase(fetchCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload.data || [];
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch main categories
            .addCase(fetchMainCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMainCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.mainCategories = action.payload.data || [];
            })
            .addCase(fetchMainCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch category by ID
            .addCase(fetchCategoryById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCategory = action.payload.data || null;
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch subcategories
            .addCase(fetchSubcategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSubcategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subcategories = action.payload.data || [];
            })
            .addCase(fetchSubcategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

// Export actions
export const { clearCurrentCategory, clearError } = categorySlice.actions;

// Export selectors
export const selectCategories = (state) => state.categories.categories;
export const selectMainCategories = (state) => state.categories.mainCategories;
export const selectCurrentCategory = (state) => state.categories.currentCategory;
export const selectSubcategories = (state) => state.categories.subcategories;
export const selectCategoriesLoading = (state) => state.categories.isLoading;
export const selectCategoriesError = (state) => state.categories.error;

// Export reducer
export default categorySlice.reducer;

