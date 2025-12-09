/**
 * API Service
 * 
 * This file contains the axios instance configuration with interceptors
 * for request/response handling, token management, and error handling.
 */

import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import { getToken, clearAuthData } from '../utils/helpers';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
// Adds authentication token to requests
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = getToken();

        // Add token to headers if available
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log('API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        // Handle request error
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
// Handles responses and errors globally
api.interceptors.response.use(
    (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
            console.log('API Response:', {
                status: response.status,
                url: response.config.url,
                data: response.data,
            });
        }

        // Return response data directly
        return response.data;
    },
    (error) => {
        // Handle response errors
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            // Handle 401 Unauthorized - Clear auth and redirect to login
            if (status === 401) {
                clearAuthData();
                // Redirect to login page (will be handled by router)
                window.location.href = '/login';
            }

            // Handle 403 Forbidden
            if (status === 403) {
                console.error('Access forbidden:', data.message || 'You do not have permission');
            }

            // Handle 404 Not Found
            if (status === 404) {
                console.error('Resource not found:', error.config.url);
            }

            // Handle 500 Server Error
            if (status >= 500) {
                console.error('Server error:', data.message || 'Internal server error');
            }

            // Return error with message and errors array
            return Promise.reject({
                message: data.message || 'An error occurred',
                status: status,
                data: data,
                errors: data.errors || [],
            });
        } else if (error.request) {
            // Request was made but no response received
            console.error('Network error:', error.message);

            // Check if it's a connection refused error (backend not running)
            let errorMessage = 'Network error. Please check your connection.';
            if (error.message && (error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('ECONNREFUSED'))) {
                errorMessage = 'Backend server is not running. Please start the backend server on port 5000.';
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED') {
                errorMessage = 'Backend server is not running. Please start the backend server on port 5000.';
            }

            return Promise.reject({
                message: errorMessage,
                status: 0,
                code: error.code,
            });
        } else {
            // Something else happened
            console.error('Error:', error.message);
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: 0,
            });
        }
    }
);

// Export API instance
export default api;

// Export common HTTP methods as convenience functions
export const apiGet = (url, config = {}) => api.get(url, config);
export const apiPost = (url, data, config = {}) => api.post(url, data, config);
export const apiPut = (url, data, config = {}) => api.put(url, data, config);
export const apiPatch = (url, data, config = {}) => api.patch(url, data, config);
export const apiDelete = (url, config = {}) => api.delete(url, config);

