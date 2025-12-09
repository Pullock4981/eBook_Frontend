/**
 * Home Service
 * API calls for home page sections
 */

import api from './api';

/**
 * Get last updated products
 */
export const getLastUpdates = async (limit = 3) => {
    try {
        // API interceptor returns response.data directly
        const response = await api.get('/products/sections/last-updates', {
            params: { limit }
        });
        // Response is already the data object: { success: true, data: [...] }
        return response;
    } catch (error) {
        console.error('Error fetching last updates:', error);
        return { success: false, data: [] };
    }
};

/**
 * Get coming soon products
 */
export const getComingSoon = async (limit = 3) => {
    try {
        const response = await api.get('/products/sections/coming-soon', {
            params: { limit }
        });
        return response;
    } catch (error) {
        console.error('Error fetching coming soon:', error);
        return { success: false, data: [] };
    }
};

/**
 * Get popular reader products
 */
export const getPopularReader = async (limit = 3) => {
    try {
        const response = await api.get('/products/sections/popular-reader', {
            params: { limit }
        });
        return response;
    } catch (error) {
        console.error('Error fetching popular reader:', error);
        return { success: false, data: [] };
    }
};

/**
 * Get frequently downloaded products
 */
export const getFrequentlyDownloaded = async (limit = 3) => {
    try {
        const response = await api.get('/products/sections/frequently-downloaded', {
            params: { limit }
        });
        return response;
    } catch (error) {
        console.error('Error fetching frequently downloaded:', error);
        return { success: false, data: [] };
    }
};

/**
 * Get user's favorited products (requires auth)
 */
export const getFavourited = async (limit = 3) => {
    try {
        const response = await api.get('/products/sections/favourited', {
            params: { limit }
        });
        return response;
    } catch (error) {
        // If not authenticated (401), return empty array
        if (error.status === 401 || error.response?.status === 401) {
            return { success: true, data: [] };
        }
        console.error('Error fetching favourited:', error);
        return { success: false, data: [] };
    }
};

/**
 * Get main categories for home page
 */
export const getMainCategories = async (limit = 6) => {
    try {
        const response = await api.get('/categories/main', {
            params: { limit }
        });
        return response;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return { success: false, data: [] };
    }
};

/**
 * Get active coupons for home page
 */
export const getActiveCoupons = async (limit = 3) => {
    try {
        const response = await api.get('/coupons/public/active', {
            params: { limit }
        });
        return response;
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return { success: false, data: [] };
    }
};

