/**
 * Cart Service
 * 
 * Service for cart-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get user's cart
 * @returns {Promise} API response
 */
export const getCart = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.CART.GET);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Add item to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise} API response
 */
export const addToCart = async (productId, quantity = 1) => {
    try {
        const response = await api.post(API_ENDPOINTS.CART.ADD, {
            productId,
            quantity
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update cart item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise} API response
 */
export const updateCartItem = async (productId, quantity) => {
    try {
        const response = await api.put(`${API_ENDPOINTS.CART.UPDATE}/${productId}`, {
            quantity
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 * @returns {Promise} API response
 */
export const removeFromCart = async (productId) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.CART.REMOVE}/${productId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Clear entire cart
 * @returns {Promise} API response
 */
export const clearCart = async () => {
    try {
        const response = await api.delete(API_ENDPOINTS.CART.CLEAR);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Apply coupon to cart
 * @param {string} couponCode - Coupon code
 * @returns {Promise} API response
 */
export const applyCoupon = async (couponCode) => {
    try {
        const response = await api.post(API_ENDPOINTS.CART.APPLY_COUPON, {
            couponCode
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Remove coupon from cart
 * @returns {Promise} API response
 */
export const removeCoupon = async () => {
    try {
        const response = await api.delete(API_ENDPOINTS.CART.REMOVE_COUPON);
        return response;
    } catch (error) {
        throw error;
    }
};

