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
            // Return full error object including validation errors
            const errorData = error.response?.data || {};
            return rejectWithValue({
                message: errorData.message || error.message || 'Failed to create order',
                errors: errorData.errors || [],
                status: error.response?.status
            });
        }
    }
);

export const fetchUserOrders = createAsyncThunk(
    'orders/fetchUserOrders',
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await orderService.getUserOrders(page, limit);
            // API interceptor returns response.data, so response = { success: true, message: '...', data: orders, pagination: {...} }
            // Backend returns: { success: true, message: '...', data: orders, pagination: {...} }
            // Backend pagination: { page, limit, total, pages }
            // Frontend expects: { currentPage, itemsPerPage, totalItems, totalPages }
            const backendPagination = response.pagination || {};
            return {
                orders: response.data || [],
                pagination: {
                    currentPage: backendPagination.page || page,
                    itemsPerPage: backendPagination.limit || limit,
                    totalItems: backendPagination.total || 0,
                    totalPages: backendPagination.pages || 1
                }
            };
        } catch (error) {
            const errorData = error.response?.data || {};
            return rejectWithValue(
                errorData.message || error.message || 'Failed to fetch orders'
            );
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderById(orderId);
            // API interceptor returns response.data, so response = { success: true, message: '...', data: order }
            // So response.data is the order object
            return response.data || response || null;
        } catch (error) {
            const errorData = error.response?.data || {};
            return rejectWithValue(
                errorData.message || error.message || 'Failed to fetch order'
            );
        }
    }
);

export const fetchOrderByOrderId = createAsyncThunk(
    'orders/fetchOrderByOrderId',
    async (orderIdString, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderByOrderId(orderIdString);
            return response.data || response || null;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch order'
            );
        }
    }
);

// Admin order actions
export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAllOrders',
    async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
        try {
            const response = await orderService.getAllOrders(page, limit, filters);
            const backendPagination = response.pagination || {};
            return {
                orders: response.data || [],
                pagination: {
                    currentPage: backendPagination.page || page,
                    itemsPerPage: backendPagination.limit || limit,
                    totalItems: backendPagination.total || 0,
                    totalPages: backendPagination.pages || 1
                }
            };
        } catch (error) {
            const errorData = error.response?.data || {};
            return rejectWithValue(
                errorData.message || error.message || 'Failed to fetch orders'
            );
        }
    }
);

export const adminUpdateOrderStatus = createAsyncThunk(
    'orders/adminUpdateOrderStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const response = await orderService.updateOrderStatus(orderId, status);
            return response.data || response;
        } catch (error) {
            const errorData = error.response?.data || {};
            return rejectWithValue(
                errorData.message || error.message || 'Failed to update order status'
            );
        }
    }
);

export const adminUpdatePaymentStatus = createAsyncThunk(
    'orders/adminUpdatePaymentStatus',
    async ({ orderId, paymentStatus, transactionId = null }, { rejectWithValue }) => {
        try {
            const response = await orderService.updatePaymentStatus(orderId, paymentStatus, transactionId);
            return response.data || response;
        } catch (error) {
            const errorData = error.response?.data || {};
            return rejectWithValue(
                errorData.message || error.message || 'Failed to update payment status'
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
                // action.payload.pagination is already mapped in the thunk
                state.pagination = action.payload.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
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
            })
            // Admin: Fetch all orders
            .addCase(fetchAllOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.orders = action.payload.orders || [];
                state.pagination = action.payload.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 0,
                    itemsPerPage: 10
                };
                state.error = null;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Admin: Update order status
            .addCase(adminUpdateOrderStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedOrder = action.payload;
                const index = state.orders.findIndex(o => o._id === updatedOrder._id);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                }
                if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
                    state.currentOrder = updatedOrder;
                }
                state.error = null;
            })
            .addCase(adminUpdateOrderStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Admin: Update payment status
            .addCase(adminUpdatePaymentStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(adminUpdatePaymentStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedOrder = action.payload;
                const index = state.orders.findIndex(o => o._id === updatedOrder._id);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                }
                if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
                    state.currentOrder = updatedOrder;
                }
                state.error = null;
            })
            .addCase(adminUpdatePaymentStatus.rejected, (state, action) => {
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

