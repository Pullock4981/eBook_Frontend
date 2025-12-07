/**
 * Cart Slice
 * 
 * Redux slice for cart state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '../../services/cartService';

// Async thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.getCart();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch cart');
        }
    }
);

export const addItemToCart = createAsyncThunk(
    'cart/addItemToCart',
    async ({ productId, quantity = 1 }, { rejectWithValue }) => {
        try {
            const response = await cartService.addToCart(productId, quantity);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add item to cart');
        }
    }
);

export const updateItemQuantity = createAsyncThunk(
    'cart/updateItemQuantity',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartService.updateCartItem(productId, quantity);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update cart item');
        }
    }
);

export const removeItemFromCart = createAsyncThunk(
    'cart/removeItemFromCart',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await cartService.removeFromCart(productId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to remove item from cart');
        }
    }
);

export const clearCartItems = createAsyncThunk(
    'cart/clearCartItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.clearCart();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to clear cart');
        }
    }
);

export const applyCouponCode = createAsyncThunk(
    'cart/applyCouponCode',
    async (couponCode, { rejectWithValue }) => {
        try {
            const response = await cartService.applyCoupon(couponCode);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to apply coupon');
        }
    }
);

export const removeCouponCode = createAsyncThunk(
    'cart/removeCouponCode',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartService.removeCoupon();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to remove coupon');
        }
    }
);

// Initial state
const initialState = {
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    coupon: null,
    itemCount: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,
};

// Create slice
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Clear cart state (on logout)
        clearCartState: (state) => {
            state.items = [];
            state.subtotal = 0;
            state.discount = 0;
            state.total = 0;
            state.coupon = null;
            state.itemCount = 0;
            state.error = null;
            state.lastUpdated = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                const response = action.payload;
                const cartData = response?.data || response || {};

                state.items = cartData.items || [];

                // Ensure numbers are properly converted
                const subtotal = Number(cartData.subtotal) || 0;
                const discount = Number(cartData.discount) || 0;
                const total = Number(cartData.total) || 0;

                state.subtotal = subtotal;
                state.discount = discount;
                // Use backend total if available, otherwise calculate
                state.total = total > 0 ? total : (subtotal - discount);
                state.coupon = cartData.coupon || null;
                state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                state.lastUpdated = cartData.lastUpdated || new Date().toISOString();
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Add item to cart
            .addCase(addItemToCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addItemToCart.fulfilled, (state, action) => {
                state.isLoading = false;
                const response = action.payload;
                const cartData = response?.data || response || {};

                state.items = cartData.items || [];

                // Ensure numbers are properly converted
                const subtotal = Number(cartData.subtotal) || 0;
                const discount = Number(cartData.discount) || 0;
                const total = Number(cartData.total) || 0;

                state.subtotal = subtotal;
                state.discount = discount;
                // Use backend total if available, otherwise calculate
                state.total = total > 0 ? total : (subtotal - discount);
                state.coupon = cartData.coupon || null;
                state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                state.lastUpdated = cartData.lastUpdated || new Date().toISOString();
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update item quantity
            .addCase(updateItemQuantity.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateItemQuantity.fulfilled, (state, action) => {
                state.isLoading = false;
                const response = action.payload;
                const cartData = response?.data || response || {};

                state.items = cartData.items || [];

                // Ensure numbers are properly converted
                const subtotal = Number(cartData.subtotal) || 0;
                const discount = Number(cartData.discount) || 0;
                const total = Number(cartData.total) || 0;

                state.subtotal = subtotal;
                state.discount = discount;
                // Use backend total if available, otherwise calculate
                state.total = total > 0 ? total : (subtotal - discount);
                state.coupon = cartData.coupon || null;
                state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                state.lastUpdated = cartData.lastUpdated || new Date().toISOString();
            })
            .addCase(updateItemQuantity.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Remove item from cart
            .addCase(removeItemFromCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(removeItemFromCart.fulfilled, (state, action) => {
                state.isLoading = false;
                const response = action.payload;
                const cartData = response?.data || response || {};

                state.items = cartData.items || [];

                // Ensure numbers are properly converted
                const subtotal = Number(cartData.subtotal) || 0;
                const discount = Number(cartData.discount) || 0;
                const total = Number(cartData.total) || 0;

                state.subtotal = subtotal;
                state.discount = discount;
                // Use backend total if available, otherwise calculate
                state.total = total > 0 ? total : (subtotal - discount);
                state.coupon = cartData.coupon || null;
                state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                state.lastUpdated = cartData.lastUpdated || new Date().toISOString();
            })
            .addCase(removeItemFromCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Clear cart
            .addCase(clearCartItems.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(clearCartItems.fulfilled, (state) => {
                state.isLoading = false;
                state.items = [];
                state.subtotal = 0;
                state.discount = 0;
                state.total = 0;
                state.coupon = null;
                state.itemCount = 0;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(clearCartItems.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Apply coupon
            .addCase(applyCouponCode.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(applyCouponCode.fulfilled, (state, action) => {
                state.isLoading = false;
                // Handle response structure: response.data or direct response
                const response = action.payload;
                const cartData = response?.data || response || {};

                state.items = cartData.items || [];

                // Ensure numbers are properly converted
                const subtotal = Number(cartData.subtotal) || 0;
                const discount = Number(cartData.discount) || 0;
                const total = Number(cartData.total) || 0;

                state.subtotal = subtotal;
                state.discount = discount;
                // Use backend total if available, otherwise calculate
                state.total = total > 0 ? total : (subtotal - discount);
                state.coupon = cartData.coupon || null;
                state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                state.lastUpdated = cartData.lastUpdated || new Date().toISOString();
            })
            .addCase(applyCouponCode.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Remove coupon
            .addCase(removeCouponCode.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(removeCouponCode.fulfilled, (state, action) => {
                state.isLoading = false;
                const response = action.payload;
                const cartData = response?.data || response || {};

                state.items = cartData.items || [];

                // Ensure numbers are properly converted
                const subtotal = Number(cartData.subtotal) || 0;
                const discount = Number(cartData.discount) || 0;
                const total = Number(cartData.total) || 0;

                state.subtotal = subtotal;
                state.discount = discount;
                // Use backend total if available, otherwise calculate
                state.total = total > 0 ? total : (subtotal - discount);
                state.coupon = null;
                state.itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                state.lastUpdated = cartData.lastUpdated || new Date().toISOString();
            })
            .addCase(removeCouponCode.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

// Export actions
export const { clearCartState } = cartSlice.actions;

// Export selectors
export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.itemCount;
export const selectCartSubtotal = (state) => state.cart.subtotal;
export const selectCartDiscount = (state) => state.cart.discount;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartCoupon = (state) => state.cart.coupon;
export const selectCartLoading = (state) => state.cart.isLoading;
export const selectCartError = (state) => state.cart.error;

// Export reducer
export default cartSlice.reducer;

