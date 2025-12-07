/**
 * User Service
 * 
 * Service layer for user-related API calls.
 * Handles profile management, address management, etc.
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get current user profile
 * @returns {Promise} API response with user data
 */
export const getCurrentUser = async () => {
    const response = await api.get(API_ENDPOINTS.USER.PROFILE);
    return response;
};

/**
 * Update user profile
 * @param {Object} data - Profile data to update
 * @returns {Promise} API response
 */
export const updateProfile = async (data) => {
    const response = await api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
    return response;
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} API response
 */
export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/users/me/password', {
        currentPassword,
        newPassword,
    });
    return response;
};

/**
 * Get user addresses
 * @returns {Promise} API response with addresses
 */
export const getAddresses = async () => {
    const response = await api.get(API_ENDPOINTS.USER.ADDRESSES);
    return response;
};

/**
 * Add new address
 * @param {Object} addressData - Address data
 * @returns {Promise} API response
 */
export const addAddress = async (addressData) => {
    const response = await api.post(API_ENDPOINTS.USER.ADDRESS, addressData);
    return response;
};

/**
 * Update address
 * @param {string} addressId - Address ID
 * @param {Object} addressData - Address data
 * @returns {Promise} API response
 */
export const updateAddress = async (addressId, addressData) => {
    const response = await api.put(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}`, addressData);
    return response;
};

/**
 * Delete address
 * @param {string} addressId - Address ID
 * @returns {Promise} API response
 */
export const deleteAddress = async (addressId) => {
    const response = await api.delete(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}`);
    return response;
};

