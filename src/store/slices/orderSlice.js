/**
 * Order Redux Slice
 * 
 * Manages order state and async operations
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as orderService from '../../services/orderService';

// Initial state
const initialState = {
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    }
};

// Async thunks
export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await orderService.createOrder(orderData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create order'
            );
        }
    }
);

export const fetchUserOrders = createAsyncThunk(
    'orders/fetchUserOrders',
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await orderService.getUserOrders(page, limit);
            return {
                orders: response.data.data || [],
                pagination: response.data.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    pages: 1
                }
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch orders'
            );
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderById(orderId);
            return response.data.data || null;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch order'
            );
        }
    }
);

export const fetchOrderByOrderId = createAsyncThunk(
    'orders/fetchOrderByOrderId',
    async (orderIdString, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderByOrderId(orderIdString);
            return response.data.data || null;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch order'
            );
        }
    }
);

// Order slice
const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        clearOrders: (state) => {
            state.orders = [];
            state.currentOrder = null;
            state.pagination = initialState.pagination;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentOrder = action.payload.data || action.payload;
                state.error = null;
                // Add to orders list
                if (action.payload.data) {
                    state.orders = [action.payload.data, ...state.orders];
                }
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch user orders
            .addCase(fetchUserOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload.orders || [];
                state.pagination = {
                    currentPage: action.payload.pagination.page || 1,
                    totalPages: action.payload.pagination.pages || 1,
                    totalItems: action.payload.pagination.total || 0,
                    itemsPerPage: action.payload.pagination.limit || 10
                };
                state.error = null;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch order by ID
            .addCase(fetchOrderById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentOrder = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch order by order ID
            .addCase(fetchOrderByOrderId.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderByOrderId.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentOrder = action.payload;
                state.error = null;
            })
            .addCase(fetchOrderByOrderId.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

// Actions
export const { clearCurrentOrder, clearOrders, clearError } = orderSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrdersPagination = (state) => state.orders.pagination;

export default orderSlice.reducer;

