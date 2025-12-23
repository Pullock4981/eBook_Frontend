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
 * Get most viewed/clicked products (Favourited section)
 */
export const getFavourited = async (limit = 3) => {
    try {
        const response = await api.get('/products/sections/favourited', {
            params: { limit }
        });
        return response;
    } catch (error) {
        console.error('Error fetching favourited:', error);
        return { success: false, data: [] };
    }
};

/**
 * Get newly added products
 */
export const getNewAdded = async (limit = 3) => {
    try {
        const response = await api.get('/products/sections/new-added', {
            params: { limit }
        });
        return response;
    } catch (error) {
        console.error('Error fetching new added:', error);
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

