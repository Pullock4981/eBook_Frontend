/**
 * useAuth Hook
 * 
 * Custom hook for authentication operations.
 * Provides convenient methods for login, register, logout, etc.
 */

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    loginSuccess,
    logout as logoutAction,
    setLoading,
    setError,
    clearError,
    selectAuth,
    selectIsAuthenticated,
    selectUser,
} from '../store/slices/authSlice';
import * as authService from '../services/authService';
import { normalizeMobileForAPI } from '../utils/helpers';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector(selectAuth);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    /**
     * Register new user
     * @param {string} mobile - Mobile number
     * @param {string} name - Full name
     * @param {string} password - Password
     * @returns {Promise} Registration result
     */
    const register = async (mobile, name, password) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const normalizedMobile = normalizeMobileForAPI(mobile);
            const response = await authService.register(normalizedMobile, name, password);

            dispatch(setLoading(false));
            // Extract OTP from response if available
            // API interceptor returns response.data from axios
            // Backend response: { success: true, data: { mobile, otp, ... } }
            // So after interceptor: response = { success: true, data: { mobile, otp, ... } }
            // OTP is at: response.data.otp
            const otp = response?.data?.otp || response?.otp || null;

            // Debug log in development
            if (import.meta.env.DEV) {
                console.log('🔑 Register - Full response:', response);
                console.log('🔑 Register - Response.data:', response?.data);
                console.log('🔑 Register - Response.data.otp:', response?.data?.otp);
                console.log('🔑 Register - OTP extracted:', otp);
            }

            return {
                success: true,
                data: response,
                otp: otp // Return OTP for display
            };
        } catch (error) {
            dispatch(setLoading(false));
            const errorMessage = error.message || error.errors?.[0]?.message || 'Registration failed';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Request OTP for login
     * @param {string} mobile - Mobile number
     * @returns {Promise} OTP request result
     */
    const requestOTP = async (mobile) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const normalizedMobile = normalizeMobileForAPI(mobile);
            const response = await authService.requestOTP(normalizedMobile);

            dispatch(setLoading(false));
            // Extract OTP from response if available
            // API interceptor returns response.data, so structure is: { success: true, data: { mobile, otp, ... } }
            const otp = response?.data?.otp || response?.otp || null;

            // Debug log in development
            if (import.meta.env.DEV) {
                console.log('🔑 RequestOTP - Full response:', response);
                console.log('🔑 RequestOTP - Response.data:', response?.data);
                console.log('🔑 RequestOTP - OTP extracted:', otp);
            }

            return {
                success: true,
                data: response,
                otp: otp // Return OTP for display
            };
        } catch (error) {
            dispatch(setLoading(false));
            const errorMessage = error.message || error.errors?.[0]?.message || 'Failed to send OTP';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Verify OTP and login
     * @param {string} mobile - Mobile number
     * @param {string} otp - OTP code
     * @returns {Promise} Login result
     */
    const verifyOTP = async (mobile, otp) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const normalizedMobile = normalizeMobileForAPI(mobile);
            const response = await authService.verifyOTP(normalizedMobile, otp);

            // Extract token and user from response
            const { token, user } = response.data || response;

            // Dispatch login success
            dispatch(loginSuccess({ token, user }));
            dispatch(setLoading(false));

            return { success: true, data: response };
        } catch (error) {
            dispatch(setLoading(false));
            const errorMessage = error.message || error.errors?.[0]?.message || 'OTP verification failed';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Login with password
     * @param {string} mobile - Mobile number
     * @param {string} password - Password
     * @returns {Promise} Login result
     */
    const loginWithPassword = async (mobile, password) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const normalizedMobile = normalizeMobileForAPI(mobile);
            const response = await authService.loginWithPassword(normalizedMobile, password);

            // Extract token and user from response
            const { token, user } = response.data || response;

            // Dispatch login success
            dispatch(loginSuccess({ token, user }));
            dispatch(setLoading(false));

            return { success: true, data: response };
        } catch (error) {
            dispatch(setLoading(false));
            const errorMessage = error.message || error.errors?.[0]?.message || 'Login failed';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Resend OTP
     * @param {string} mobile - Mobile number
     * @returns {Promise} Resend result
     */
    const resendOTP = async (mobile) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const normalizedMobile = normalizeMobileForAPI(mobile);
            const response = await authService.resendOTP(normalizedMobile);

            dispatch(setLoading(false));
            // Extract OTP from response if available
            // API interceptor returns response.data, so structure is: { success: true, data: { mobile, otp, ... } }
            const otp = response?.data?.otp || response?.otp || null;

            // Debug log in development
            if (import.meta.env.DEV) {
                console.log('🔑 ResendOTP - Full response:', response);
                console.log('🔑 ResendOTP - Response.data:', response?.data);
                console.log('🔑 ResendOTP - OTP extracted:', otp);
            }

            return {
                success: true,
                data: response,
                otp: otp // Return OTP for display
            };
        } catch (error) {
            dispatch(setLoading(false));
            const errorMessage = error.message || error.errors?.[0]?.message || 'Failed to resend OTP';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch(logoutAction());
            navigate('/');
        }
    };

    /**
     * Clear error
     */
    const clearAuthError = () => {
        dispatch(clearError());
    };

    return {
        // State
        auth,
        isAuthenticated,
        user,
        isLoading: auth.isLoading,
        error: auth.error,

        // Actions
        register,
        requestOTP,
        verifyOTP,
        loginWithPassword,
        resendOTP,
        logout,
        clearAuthError,
    };
};

