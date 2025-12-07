/**
 * Category Service
 * Business logic layer for category-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all categories
 * @returns {Promise} API response
 */
export const getAllCategories = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get main categories only
 * @returns {Promise} API response
 */
export const getMainCategories = async () => {
    try {
        const response = await api.get(`${API_ENDPOINTS.CATEGORIES.LIST}/main`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Promise} API response
 */
export const getCategoryById = async (id) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.CATEGORIES.DETAIL}/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get subcategories of a parent category
 * @param {string} parentId - Parent category ID
 * @returns {Promise} API response
 */
export const getSubcategories = async (parentId) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.CATEGORIES.DETAIL}/${parentId}/subcategories`);
        return response;
    } catch (error) {
        throw error;
    }
};

