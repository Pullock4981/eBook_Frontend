/**
 * Coupon Service
 * 
 * Service for coupon-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Validate coupon code
 * @param {string} code - Coupon code
 * @param {number} cartAmount - Cart total amount
 * @returns {Promise} API response
 */
export const validateCoupon = async (code, cartAmount) => {
    try {
        const response = await api.post(API_ENDPOINTS.COUPONS.VALIDATE, {
            code,
            cartAmount
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get coupon by code
 * @param {string} code - Coupon code
 * @returns {Promise} API response
 */
export const getCouponByCode = async (code) => {
    try {
        const response = await api.get(`/coupons/code/${code}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get active coupons (Public)
 * @param {number} limit - Maximum number of coupons
 * @returns {Promise} API response
 */
export const getActiveCoupons = async (limit = 5) => {
    try {
        const response = await api.get(`/coupons/public/active?limit=${limit}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all coupons (Admin)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {object} filters - Filter options
 * @returns {Promise} API response
 */
export const getAllCoupons = async (page = 1, limit = 10, filters = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });
        const response = await api.get(`/coupons?${params.toString()}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get coupon by ID (Admin)
 * @param {string} id - Coupon ID
 * @returns {Promise} API response
 */
export const getCouponById = async (id) => {
    try {
        const response = await api.get(`/coupons/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Create coupon (Admin)
 * @param {object} couponData - Coupon data
 * @returns {Promise} API response
 */
export const createCoupon = async (couponData) => {
    try {
        const response = await api.post('/coupons', couponData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update coupon (Admin)
 * @param {string} id - Coupon ID
 * @param {object} couponData - Updated coupon data
 * @returns {Promise} API response
 */
export const updateCoupon = async (id, couponData) => {
    try {
        const response = await api.put(`/coupons/${id}`, couponData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete coupon (Admin)
 * @param {string} id - Coupon ID
 * @returns {Promise} API response
 */
export const deleteCoupon = async (id) => {
    try {
        const response = await api.delete(`/coupons/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get pending affiliate coupons (Admin)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} API response
 */
export const getPendingAffiliateCoupons = async (page = 1, limit = 10) => {
    try {
        console.log('getPendingAffiliateCoupons - Calling API with params:', { page, limit });
        const response = await api.get(`/coupons/pending-affiliate`, {
            params: { page, limit }
        });
        console.log('getPendingAffiliateCoupons - API response received:', response);
        console.log('getPendingAffiliateCoupons - Response type:', typeof response);
        console.log('getPendingAffiliateCoupons - Response keys:', Object.keys(response || {}));
        return response;
    } catch (error) {
        console.error('getPendingAffiliateCoupons - API error:', error);
        console.error('getPendingAffiliateCoupons - Error response:', error?.response);
        throw error;
    }
};

/**
 * Approve affiliate coupon (Admin)
 * @param {string} id - Coupon ID
 * @returns {Promise} API response
 */
export const approveAffiliateCoupon = async (id) => {
    try {
        const response = await api.post(`/coupons/${id}/approve`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Reject affiliate coupon (Admin)
 * @param {string} id - Coupon ID
 * @returns {Promise} API response
 */
export const rejectAffiliateCoupon = async (id) => {
    try {
        const response = await api.post(`/coupons/${id}/reject`);
        return response;
    } catch (error) {
        throw error;
    }
};

