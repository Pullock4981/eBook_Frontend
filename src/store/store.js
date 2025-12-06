/**
 * Redux Store Configuration
 * 
 * This file configures the Redux store with all slices and middleware.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import themeReducer from './slices/themeSlice';

// Configure store
export const store = configureStore({
    reducer: {
        auth: authReducer,
        app: appReducer,
        theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST'],
            },
        }),
    devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

// Type exports for TypeScript (commented out for JavaScript)
// If you convert to TypeScript in the future, uncomment these:
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

