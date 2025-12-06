/**
 * Theme Slice
 * 
 * Redux slice for theme state management.
 * Handles theme switching and persistence.
 */

import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../utils/constants';

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        const theme = savedTheme || 'light';

        // Apply theme to document immediately
        const html = document.documentElement;
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            html.classList.add('dark');
        } else {
            html.setAttribute('data-theme', 'light');
            html.classList.remove('dark');
        }

        return theme;
    }
    return 'light';
};

// Initial state
const initialState = {
    theme: getInitialTheme(),
};

// Create slice
const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        // Set theme
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem(STORAGE_KEYS.THEME, action.payload);

            // Update document attribute for DaisyUI
            const html = document.documentElement;
            if (action.payload === 'dark') {
                html.setAttribute('data-theme', 'dark');
                html.classList.add('dark');
            } else {
                html.setAttribute('data-theme', 'light');
                html.classList.remove('dark');
            }
        },

        // Toggle theme
        toggleTheme: (state) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            state.theme = newTheme;
            localStorage.setItem(STORAGE_KEYS.THEME, newTheme);

            // Update document attribute for DaisyUI
            const html = document.documentElement;
            if (newTheme === 'dark') {
                html.setAttribute('data-theme', 'dark');
                html.classList.add('dark');
            } else {
                html.setAttribute('data-theme', 'light');
                html.classList.remove('dark');
            }
        },
    },
});

// Export actions
export const { setTheme, toggleTheme } = themeSlice.actions;

// Export selectors
export const selectTheme = (state) => state.theme.theme;
export const selectIsDark = (state) => state.theme.theme === 'dark';

// Export reducer
export default themeSlice.reducer;

