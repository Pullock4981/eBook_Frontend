/**
 * eBook Slice
 * 
 * Redux slice for eBook state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as ebookService from '../../services/ebookService';

// Initial state
const initialState = {
    eBooks: [],
    currenteBook: null,
    accessToken: null,
    viewerURL: null,
    isLoading: false,
    error: null,
};

// Async thunks
export const fetchUserEBooks = createAsyncThunk(
    'ebook/fetchUserEBooks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ebookService.getUserEBooks();
            // API interceptor returns response.data, so response is { success, message, data }
            const eBooks = response?.data?.eBooks || response?.data || [];
            return eBooks;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch eBooks'
            );
        }
    }
);

export const fetcheBookAccess = createAsyncThunk(
    'ebook/fetcheBookAccess',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await ebookService.geteBookAccess(productId);
            return response?.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to get eBook access'
            );
        }
    }
);

export const fetchViewerURL = createAsyncThunk(
    'ebook/fetchViewerURL',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await ebookService.getViewerURL(productId);
            return response?.data || response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to get viewer URL'
            );
        }
    }
);

export const revokeeBookAccess = createAsyncThunk(
    'ebook/revokeeBookAccess',
    async (accessId, { rejectWithValue }) => {
        try {
            await ebookService.revokeeBookAccess(accessId);
            return accessId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to revoke access'
            );
        }
    }
);

// eBook slice
const ebookSlice = createSlice({
    name: 'ebook',
    initialState,
    reducers: {
        clearCurrenteBook: (state) => {
            state.currenteBook = null;
            state.accessToken = null;
            state.viewerURL = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch user eBooks
            .addCase(fetchUserEBooks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserEBooks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.eBooks = Array.isArray(action.payload) ? action.payload : [];
                state.error = null;
            })
            .addCase(fetchUserEBooks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch eBook access
            .addCase(fetcheBookAccess.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetcheBookAccess.fulfilled, (state, action) => {
                state.isLoading = false;
                state.accessToken = action.payload?.accessToken || null;
                state.currenteBook = action.payload?.product || null;
                state.error = null;
            })
            .addCase(fetcheBookAccess.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch viewer URL
            .addCase(fetchViewerURL.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchViewerURL.fulfilled, (state, action) => {
                state.isLoading = false;
                state.viewerURL = action.payload?.viewerURL || null;
                state.accessToken = action.payload?.accessToken || null;
                state.error = null;
            })
            .addCase(fetchViewerURL.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Revoke access
            .addCase(revokeeBookAccess.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(revokeeBookAccess.fulfilled, (state, action) => {
                state.isLoading = false;
                state.eBooks = state.eBooks.filter(ebook => ebook.id !== action.payload);
                state.error = null;
            })
            .addCase(revokeeBookAccess.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

// Actions
export const { clearCurrenteBook, clearError, setAccessToken } = ebookSlice.actions;

// Selectors
export const selectEBooks = (state) => state.ebook.eBooks;
export const selectCurrenteBook = (state) => state.ebook.currenteBook;
export const selectAccessToken = (state) => state.ebook.accessToken;
export const selectViewerURL = (state) => state.ebook.viewerURL;
export const selectEBookLoading = (state) => state.ebook.isLoading;
export const selectEBookError = (state) => state.ebook.error;

export default ebookSlice.reducer;

