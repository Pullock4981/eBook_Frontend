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

/**
 * Get all orders (Admin)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {object} filters - Filter options
 * @returns {Promise} API response
 */
export const getAllOrders = async (page = 1, limit = 10, filters = {}) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.ORDERS.DETAIL}/admin/all`, {
            params: { page, limit, ...filters }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update order status (Admin)
 * @param {string} orderId - Order ID
 * @param {string} status - New order status
 * @returns {Promise} API response
 */
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await api.put(`${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/status`, { status });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update payment status (Admin)
 * @param {string} orderId - Order ID
 * @param {string} paymentStatus - New payment status
 * @param {string} transactionId - Transaction ID (optional)
 * @returns {Promise} API response
 */
export const updatePaymentStatus = async (orderId, paymentStatus, transactionId = null) => {
    try {
        const response = await api.put(`${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/payment-status`, {
            paymentStatus,
            transactionId
        });
        return response;
    } catch (error) {
        throw error;
    }
};

