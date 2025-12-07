/**
 * Admin Slice
 * 
 * Redux slice for admin dashboard state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminService from '../../services/adminService';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
    'admin/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await adminService.getDashboardStats();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
        }
    }
);

// Initial state
const initialState = {
    dashboard: {
        overview: null,
        orders: null,
        revenue: null,
        products: null,
        affiliates: null
    },
    isLoading: false,
    error: null,
    lastUpdated: null
};

// Create slice
const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminState: (state) => {
            state.dashboard = initialState.dashboard;
            state.error = null;
            state.lastUpdated = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch dashboard stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.isLoading = false;
                const response = action.payload;
                const dashboardData = response?.data || response || {};
                state.dashboard = {
                    overview: dashboardData.overview || null,
                    orders: dashboardData.orders || null,
                    revenue: dashboardData.revenue || null,
                    products: dashboardData.products || null,
                    affiliates: dashboardData.affiliates || null
                };
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch dashboard stats';
            });
    }
});

// Export actions
export const { clearAdminState } = adminSlice.actions;

// Selectors
export const selectDashboard = (state) => state.admin.dashboard;
export const selectDashboardLoading = (state) => state.admin.isLoading;
export const selectDashboardError = (state) => state.admin.error;
export const selectDashboardOverview = (state) => state.admin.dashboard.overview;
export const selectDashboardOrders = (state) => state.admin.dashboard.orders;
export const selectDashboardRevenue = (state) => state.admin.dashboard.revenue;
export const selectDashboardProducts = (state) => state.admin.dashboard.products;
export const selectDashboardAffiliates = (state) => state.admin.dashboard.affiliates;

export default adminSlice.reducer;

