/**
 * Auth Slice
 * 
 * Redux slice for authentication state management.
 * Handles user login, logout, token management, and user data.
 */

import { createSlice } from '@reduxjs/toolkit';
import { getToken, getUserData, setToken, setUserData, clearAuthData } from '../../utils/helpers';

// Initial state
const initialState = {
    token: getToken() || null,
    user: getUserData() || null,
    isAuthenticated: !!getToken(),
    isLoading: false,
    error: null,
};

// Create slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set loading state
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },

        // Set error
        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Login success
        loginSuccess: (state, action) => {
            const { token, user } = action.payload;
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;

            // Save to localStorage
            setToken(token);
            setUserData(user);
        },

        // Logout
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;

            // Clear localStorage
            clearAuthData();
        },

        // Update user data
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            setUserData(state.user);
        },

        // Refresh token
        refreshToken: (state, action) => {
            state.token = action.payload;
            setToken(action.payload);
        },
    },
});

// Export actions
export const {
    setLoading,
    setError,
    clearError,
    loginSuccess,
    logout,
    updateUser,
    refreshToken,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

// Export reducer
export default authSlice.reducer;

