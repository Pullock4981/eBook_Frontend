/**
 * Auth Service
 * 
 * Service layer for authentication-related API calls.
 * Handles registration, login, OTP verification, and token management.
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Register new user
 * @param {string} mobile - Mobile number
 * @param {string} name - Full name
 * @param {string} password - Password
 * @returns {Promise} API response
 */
export const register = async (mobile, name, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, { mobile, name, password });
    return response;
};

/**
 * Request OTP for login (passwordless)
 * @param {string} mobile - Mobile number
 * @returns {Promise} API response
 */
export const requestOTP = async (mobile) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { mobile });
    return response;
};

/**
 * Verify OTP and login
 * @param {string} mobile - Mobile number
 * @param {string} otp - OTP code
 * @returns {Promise} API response with token and user data
 */
export const verifyOTP = async (mobile, otp) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { mobile, otp });
    return response;
};

/**
 * Login with password (if password is set)
 * @param {string} mobile - Mobile number
 * @param {string} password - Password
 * @returns {Promise} API response with token and user data
 */
export const loginWithPassword = async (mobile, password) => {
    const response = await api.post('/auth/login-password', { mobile, password });
    return response;
};

/**
 * Resend OTP
 * @param {string} mobile - Mobile number
 * @returns {Promise} API response
 */
export const resendOTP = async (mobile) => {
    const response = await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { mobile });
    return response;
};

/**
 * Logout user
 * @returns {Promise} API response
 */
export const logout = async () => {
    try {
        await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
        // Even if API call fails, we should clear local data
        console.error('Logout error:', error);
    }
};

