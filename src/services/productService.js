/**
 * Product Service
 * Business logic layer for product-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all products with filters and pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} API response
 */
export const getAllProducts = async (filters = {}, page = 1, limit = 12) => {
    try {
        const params = {
            page,
            limit,
            sortBy: filters.sortBy || 'createdAt',
            sortOrder: filters.sortOrder || 'desc',
            ...(filters.type && { type: filters.type }),
            ...(filters.category && { category: filters.category }),
            ...(filters.minPrice && { minPrice: filters.minPrice }),
            ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
            ...(filters.isFeatured !== undefined && { isFeatured: filters.isFeatured }),
        };

        const response = await api.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get product by ID
 * @param {string} id - Product ID
 * @param {boolean} incrementViews - Whether to increment view count
 * @returns {Promise} API response
 */
export const getProductById = async (id, incrementViews = true) => {
    try {
        const params = incrementViews ? { views: 'true' } : { views: 'false' };
        const response = await api.get(`${API_ENDPOINTS.PRODUCTS.DETAIL}/${id}`, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get product by slug
 * @param {string} slug - Product slug
 * @param {boolean} incrementViews - Whether to increment view count
 * @returns {Promise} API response
 */
export const getProductBySlug = async (slug, incrementViews = true) => {
    try {
        const params = incrementViews ? { views: 'true' } : { views: 'false' };
        const response = await api.get(`${API_ENDPOINTS.PRODUCTS.DETAIL}/slug/${slug}`, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Search products
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} API response
 */
export const searchProducts = async (query, page = 1, limit = 12) => {
    try {
        const params = {
            q: query,
            page,
            limit,
        };

        const response = await api.get(API_ENDPOINTS.PRODUCTS.SEARCH, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get featured products
 * @param {number} limit - Number of products
 * @returns {Promise} API response
 */
export const getFeaturedProducts = async (limit = 10) => {
    try {
        const params = { limit };
        const response = await api.get(`${API_ENDPOINTS.PRODUCTS.LIST}/featured`, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get products by category
 * @param {string} categoryId - Category ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} API response
 */
export const getProductsByCategory = async (categoryId, page = 1, limit = 12) => {
    try {
        const params = { page, limit };
        const response = await api.get(`${API_ENDPOINTS.PRODUCTS.LIST}/category/${categoryId}`, { params });
        return response;
    } catch (error) {
        throw error;
    }
};

