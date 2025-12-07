/**
 * Order Service
 * 
 * Service for order-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Create order from cart
 * @param {Object} orderData - Order data (shippingAddress, paymentMethod, notes, etc.)
 * @returns {Promise} API response
 */
export const createOrder = async (orderData) => {
    try {
        const response = await api.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get user's orders
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} API response
 */
export const getUserOrders = async (page = 1, limit = 10) => {
    try {
        const response = await api.get(API_ENDPOINTS.ORDERS.LIST, {
            params: { page, limit }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise} API response
 */
export const getOrderById = async (orderId) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get order by order ID (ORD-XXXXXX)
 * @param {string} orderIdString - Order ID string (ORD-XXXXXX)
 * @returns {Promise} API response
 */
export const getOrderByOrderId = async (orderIdString) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.ORDERS.DETAIL}/order-id/${orderIdString}`);
        return response;
    } catch (error) {
        throw error;
    }
};

