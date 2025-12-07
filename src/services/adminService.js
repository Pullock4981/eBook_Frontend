/**
 * Admin Service
 * 
 * Service for admin-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Create product (Admin)
 * @param {Object} productData - Product data
 * @returns {Promise} API response
 */
export const createProduct = async (productData) => {
    try {
        const response = await api.post(API_ENDPOINTS.PRODUCTS.LIST, productData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update product (Admin)
 * @param {string} id - Product ID
 * @param {Object} productData - Product data
 * @returns {Promise} API response
 */
export const updateProduct = async (id, productData) => {
    try {
        const response = await api.put(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`, productData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete product (Admin)
 * @param {string} id - Product ID
 * @returns {Promise} API response
 */
export const deleteProduct = async (id) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Create category (Admin)
 * @param {Object} categoryData - Category data
 * @returns {Promise} API response
 */
export const createCategory = async (categoryData) => {
    try {
        const response = await api.post(API_ENDPOINTS.CATEGORIES.LIST, categoryData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update category (Admin)
 * @param {string} id - Category ID
 * @param {Object} categoryData - Category data
 * @returns {Promise} API response
 */
export const updateCategory = async (id, categoryData) => {
    try {
        const response = await api.put(`${API_ENDPOINTS.CATEGORIES.DETAIL}/${id}`, categoryData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all categories (Admin)
 * @returns {Promise} API response
 */
export const getCategories = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete category (Admin)
 * @param {string} id - Category ID
 * @returns {Promise} API response
 */
export const deleteCategory = async (id) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.CATEGORIES.DETAIL}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get dashboard statistics (Admin)
 * @returns {Promise} API response
 */
export const getDashboardStats = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get user statistics (Admin)
 * @returns {Promise} API response
 */
export const getUserStats = async () => {
    try {
        const response = await api.get(`${API_ENDPOINTS.ADMIN.USERS}/stats`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all users (Admin)
 * @param {Object} params - Query parameters (page, limit, role, isVerified, search)
 * @returns {Promise} API response
 */
export const getAllUsers = async (params = {}) => {
    try {
        const response = await api.get(API_ENDPOINTS.ADMIN.USERS, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user role (Admin)
 * @param {string} userId - User ID
 * @param {string} role - New role (admin or user)
 * @returns {Promise} API response
 */
export const updateUserRole = async (userId, role) => {
    try {
        const response = await api.put(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/role`, { role });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user status (Admin) - Ban/Unban user
 * @param {string} userId - User ID
 * @param {boolean} isActive - User active status
 * @returns {Promise} API response
 */
export const updateUserStatus = async (userId, isActive) => {
    try {
        const response = await api.put(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/status`, { isActive });
        return response;
    } catch (error) {
        throw error;
    }
};

