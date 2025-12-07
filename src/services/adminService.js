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

