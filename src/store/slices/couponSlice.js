/**
 * Coupon Slice
 * 
 * Redux slice for coupon state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as couponService from '../../services/couponService';

// Initial state
const initialState = {
    coupons: [],
    currentCoupon: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    },
    isLoading: false,
    error: null,
    validationResult: null,
    isValidationLoading: false,
    validationError: null
};

// Async thunks
export const fetchActiveCoupons = createAsyncThunk(
    'coupon/fetchActiveCoupons',
    async ({ limit = 5 }, { rejectWithValue }) => {
        try {
            const response = await couponService.getActiveCoupons(limit);
            // API interceptor returns response.data, so response = { success: true, data: coupons, count: ... }
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch active coupons');
        }
    }
);

export const validateCoupon = createAsyncThunk(
    'coupon/validateCoupon',
    async ({ code, cartAmount }, { rejectWithValue }) => {
        try {
            const response = await couponService.validateCoupon(code, cartAmount);
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to validate coupon');
        }
    }
);

export const fetchAllCoupons = createAsyncThunk(
    'coupon/fetchAllCoupons',
    async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
        try {
            const response = await couponService.getAllCoupons(page, limit, filters);
            // API interceptor returns response.data, so response = { success: true, message: '...', data: coupons, pagination: {...} }
            // Backend returns: { success: true, data: coupons, pagination: {...} }
            return response; // Return as-is, reducer will handle structure
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch coupons');
        }
    }
);

export const fetchCouponById = createAsyncThunk(
    'coupon/fetchCouponById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await couponService.getCouponById(id);
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch coupon');
        }
    }
);

export const createCoupon = createAsyncThunk(
    'coupon/createCoupon',
    async (couponData, { rejectWithValue }) => {
        try {
            const response = await couponService.createCoupon(couponData);
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create coupon');
        }
    }
);

export const updateCoupon = createAsyncThunk(
    'coupon/updateCoupon',
    async ({ id, couponData }, { rejectWithValue }) => {
        try {
            const response = await couponService.updateCoupon(id, couponData);
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update coupon');
        }
    }
);

export const deleteCoupon = createAsyncThunk(
    'coupon/deleteCoupon',
    async (id, { rejectWithValue }) => {
        try {
            const response = await couponService.deleteCoupon(id);
            return response.data || response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete coupon');
        }
    }
);

// Slice
const couponSlice = createSlice({
    name: 'coupon',
    initialState,
    reducers: {
        clearValidationResult: (state) => {
            state.validationResult = null;
            state.validationError = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentCoupon: (state) => {
            state.currentCoupon = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Validate coupon
            .addCase(validateCoupon.pending, (state) => {
                state.isValidationLoading = true;
                state.validationError = null;
                state.validationResult = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.isValidationLoading = false;
                state.validationResult = action.payload;
                state.validationError = null;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.isValidationLoading = false;
                state.validationError = action.payload;
                state.validationResult = null;
            })
            // Fetch all coupons
            .addCase(fetchAllCoupons.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllCoupons.fulfilled, (state, action) => {
                state.isLoading = false;
                // API interceptor returns response.data, so action.payload = { success: true, data: [...], pagination: {...} }
                const payload = action.payload;
                // Backend returns: { success: true, data: coupons, pagination: {...} }
                state.coupons = payload.data || payload.coupons || (Array.isArray(payload) ? payload : []);
                state.pagination = payload.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                };
            })
            .addCase(fetchAllCoupons.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch coupon by ID
            .addCase(fetchCouponById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCouponById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCoupon = action.payload;
            })
            .addCase(fetchCouponById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create coupon
            .addCase(createCoupon.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.coupons.unshift(action.payload);
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update coupon
            .addCase(updateCoupon.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.coupons.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.coupons[index] = action.payload;
                }
                if (state.currentCoupon?._id === action.payload._id) {
                    state.currentCoupon = action.payload;
                }
            })
            .addCase(updateCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Delete coupon
            .addCase(deleteCoupon.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.isLoading = false;
                state.coupons = state.coupons.filter(c => c._id !== action.payload._id);
                if (state.currentCoupon?._id === action.payload._id) {
                    state.currentCoupon = null;
                }
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearValidationResult, clearError, clearCurrentCoupon } = couponSlice.actions;

// Selectors
export const selectCoupons = (state) => state.coupon.coupons;
export const selectCurrentCoupon = (state) => state.coupon.currentCoupon;
export const selectCouponPagination = (state) => state.coupon.pagination;
export const selectCouponLoading = (state) => state.coupon.isLoading;
export const selectCouponError = (state) => state.coupon.error;
export const selectValidationResult = (state) => state.coupon.validationResult;
export const selectValidationLoading = (state) => state.coupon.isValidationLoading;
export const selectValidationError = (state) => state.coupon.validationError;

export default couponSlice.reducer;

