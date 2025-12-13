/**
 * eBook Service
 * 
 * Service for eBook-related API calls
 */

import api from './api';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/constants';

/**
 * Get user's purchased eBooks
 * @returns {Promise} API response with eBooks list
 */
export const getUserEBooks = async () => {
    const response = await api.get(API_ENDPOINTS.EBOOK.LIST);
    return response;
};

/**
 * Get eBook access token for a product
 * @param {string} productId - Product ID
 * @returns {Promise} API response with access token
 */
export const geteBookAccess = async (productId) => {
    const response = await api.get(`${API_ENDPOINTS.EBOOK.ACCESS}/${productId}/access`);
    return response;
};

/**
 * Get eBook viewer URL
 * @param {string} productId - Product ID
 * @returns {Promise} API response with viewer URL
 */
export const getViewerURL = async (productId) => {
    const response = await api.get(`${API_ENDPOINTS.EBOOK.VIEWER}/${productId}/viewer`);
    return response;
};

/**
 * Get PDF URL with access token
 * @param {string} accessToken - Access token
 * @returns {string} PDF URL
 */
export const getPDFURL = (accessToken) => {
    // Use API_BASE_URL from constants for consistency
    const baseURL = import.meta.env.VITE_API_BASE_URL || API_BASE_URL;
    return `${baseURL}/ebooks/view?token=${accessToken}`;
};

/**
 * Get PDF as blob for PDF.js
 * @param {string} accessToken - Access token
 * @returns {Promise<Blob>} PDF blob
 */
export const getPDFBlob = async (accessToken) => {
    // Use API_BASE_URL from constants for consistency
    const baseURL = import.meta.env.VITE_API_BASE_URL || API_BASE_URL;
    const url = `${baseURL}/ebooks/view?token=${accessToken}`;

    const response = await api.get(url, {
        responseType: 'blob',
    });

    return response.data;
};

/**
 * Revoke eBook access
 * @param {string} accessId - Access ID
 * @returns {Promise} API response
 */
export const revokeeBookAccess = async (accessId) => {
    const response = await api.delete(`${API_ENDPOINTS.LIST}/${accessId}`);
    return response;
};

/**
 * Check if user has access to an eBook
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>} True if user has access
 */
export const checkeBookAccess = async (productId) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.EBOOK.ACCESS}/${productId}/access`);
        return response?.success === true || (response?.data && response.data.accessToken) ? true : false;
    } catch (error) {
        // If 404 or 403, user doesn't have access - this is expected for non-purchased products
        // Don't log as error since it's a normal case
        if (error.status === 404 || error.status === 404 || error.status === 403 || error.status === 403) {
            // User doesn't have access - this is normal, not an error
            return false;
        }
        // For other errors, log but still return false
        console.warn('eBook access check error:', error.message);
        return false;
    }
};

