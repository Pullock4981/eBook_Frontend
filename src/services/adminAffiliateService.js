/**
 * Admin Affiliate Service
 * API calls for admin affiliate management
 */

import api from './api';

/**
 * Get all affiliates (Admin)
 * @param {Object} filters - Filter options (status, search)
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise} API response
 */
export const getAllAffiliates = async (filters = {}, page = 1, limit = 10) => {
    try {
        const params = { page, limit, ...filters };
        console.log('API Call - getAllAffiliates:', {
            url: '/admin/affiliates',
            params: params
        });
        const response = await api.get('/admin/affiliates', { params });
        console.log('API Response received:', response);
        console.log('Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error in getAllAffiliates:', error);
        console.error('Error response:', error.response);
        throw error;
    }
};

/**
 * Approve affiliate (Admin)
 * @param {String} affiliateId - Affiliate ID
 * @returns {Promise} API response
 */
export const approveAffiliate = async (affiliateId) => {
    try {
        const response = await api.put(`/admin/affiliates/${affiliateId}/approve`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Reject affiliate (Admin)
 * @param {String} affiliateId - Affiliate ID
 * @param {String} reason - Rejection reason
 * @returns {Promise} API response
 */
export const rejectAffiliate = async (affiliateId, reason) => {
    try {
        const response = await api.put(`/admin/affiliates/${affiliateId}/reject`, { reason });
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Suspend affiliate (Admin)
 * @param {String} affiliateId - Affiliate ID
 * @returns {Promise} API response
 */
export const suspendAffiliate = async (affiliateId) => {
    try {
        const response = await api.put(`/admin/affiliates/${affiliateId}/suspend`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get affiliate analytics (Admin)
 * @returns {Promise} API response
 */
export const getAffiliateAnalytics = async () => {
    try {
        const response = await api.get('/admin/affiliates/analytics');
        return response.data;
    } catch (error) {
        throw error;
    }
};

