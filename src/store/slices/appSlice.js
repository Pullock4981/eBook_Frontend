/**
 * App Slice
 * 
 * Redux slice for application-level state management.
 * Handles loading states, notifications, modals, etc.
 */

import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
    isLoading: false,
    loadingMessage: null,
    notification: null,
    sidebarOpen: false,
    searchQuery: '',
    filters: {},
};

// Create slice
const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        // Set loading state
        setLoading: (state, action) => {
            state.isLoading = action.payload.isLoading || false;
            state.loadingMessage = action.payload.message || null;
        },

        // Show notification
        showNotification: (state, action) => {
            state.notification = {
                type: action.payload.type || 'info', // success, error, warning, info
                message: action.payload.message,
                duration: action.payload.duration || 3000,
            };
        },

        // Clear notification
        clearNotification: (state) => {
            state.notification = null;
        },

        // Toggle sidebar
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },

        // Set sidebar open
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },

        // Set search query
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },

        // Set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Clear filters
        clearFilters: (state) => {
            state.filters = {};
        },

        // Reset app state
        resetApp: (state) => {
            return initialState;
        },
    },
});

// Export actions
export const {
    setLoading,
    showNotification,
    clearNotification,
    toggleSidebar,
    setSidebarOpen,
    setSearchQuery,
    setFilters,
    clearFilters,
    resetApp,
} = appSlice.actions;

// Export selectors
export const selectApp = (state) => state.app;
export const selectIsLoading = (state) => state.app.isLoading;
export const selectLoadingMessage = (state) => state.app.loadingMessage;
export const selectNotification = (state) => state.app.notification;
export const selectSidebarOpen = (state) => state.app.sidebarOpen;
export const selectSearchQuery = (state) => state.app.searchQuery;
export const selectFilters = (state) => state.app.filters;

// Export reducer
export default appSlice.reducer;

