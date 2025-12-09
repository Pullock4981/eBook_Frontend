/**
 * Affiliate Service
 * API calls for affiliate operations
 */

import api from './api';

/**
 * Register as affiliate
 */
export const registerAsAffiliate = async (affiliateData) => {
    try {
        console.log('Calling API - registerAsAffiliate with data:', affiliateData);
        const response = await api.post('/affiliates/register', affiliateData);
        console.log('API Response:', response);
        console.log('Response data:', response.data);
        return response.data;
    } catch (error) {
        console.error('API Error in registerAsAffiliate:', error);
        console.error('Error response:', error.response);
        // Re-throw to let component handle it
        throw error;
    }
};

/**
 * Get affiliate profile
 */
export const getAffiliateProfile = async () => {
    try {
        console.log('Calling API - getAffiliateProfile');
        const response = await api.get('/affiliates/profile');
        console.log('API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response data structure:', {
            success: response.data?.success,
            hasData: !!response.data?.data,
            hasAffiliate: !!response.data?.data?.affiliate,
            affiliateStatus: response.data?.data?.affiliate?.status
        });
        return response.data;
    } catch (error) {
        console.error('API Error in getAffiliateProfile:', error);
        console.error('Error response:', error.response);
        throw error;
    }
};

/**
 * Get affiliate statistics
 */
export const getAffiliateStatistics = async () => {
    const response = await api.get('/affiliates/statistics');
    return response.data;
};

/**
 * Get commissions
 */
export const getCommissions = async (filters = {}, page = 1, limit = 10) => {
    const params = { page, limit, ...filters };
    const response = await api.get('/affiliates/commissions', { params });
    return response.data;
};

/**
 * Create withdraw request
 */
export const createWithdrawRequest = async (withdrawData) => {
    const response = await api.post('/affiliates/withdraw', withdrawData);
    return response.data;
};

/**
 * Get withdraw requests
 */
export const getWithdrawRequests = async (page = 1, limit = 10) => {
    const response = await api.get('/affiliates/withdraw-requests', {
        params: { page, limit }
    });
    return response.data;
};

/**
 * Update payment details
 */
export const updatePaymentDetails = async (paymentDetails) => {
    const response = await api.put('/affiliates/payment-details', paymentDetails);
    return response.data;
};

/**
 * Cancel affiliate registration
 */
export const cancelAffiliateRegistration = async () => {
    try {
        console.log('Calling API - cancelAffiliateRegistration');
        const response = await api.delete('/affiliates/cancel');
        console.log('Cancel response:', response);
        return response.data;
    } catch (error) {
        console.error('API Error in cancelAffiliateRegistration:', error);
        throw error;
    }
};

/**
 * Generate affiliate coupon
 */
export const generateAffiliateCoupon = async (couponData) => {
    try {
        console.log('Calling API - generateAffiliateCoupon with data:', couponData);
        const response = await api.post('/affiliates/coupons', couponData);
        console.log('Generate coupon response:', response);
        return response.data;
    } catch (error) {
        console.error('API Error in generateAffiliateCoupon:', error);
        throw error;
    }
};

/**
 * Get affiliate coupons
 */
export const getAffiliateCoupons = async (page = 1, limit = 10) => {
    try {
        console.log('Calling API - getAffiliateCoupons', { page, limit });
        const response = await api.get('/affiliates/coupons', {
            params: { page, limit }
        });
        console.log('Get coupons response:', response);
        return response.data;
    } catch (error) {
        console.error('API Error in getAffiliateCoupons:', error);
        throw error;
    }
};

