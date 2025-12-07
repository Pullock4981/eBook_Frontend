/**
 * Application Constants
 * 
 * This file contains all constant values used throughout the application.
 * Centralized constants make it easier to maintain and update values.
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        VERIFY_OTP: '/auth/verify-otp',
        RESEND_OTP: '/auth/resend-otp',
        LOGOUT: '/auth/logout',
    },
    // User endpoints
    USER: {
        PROFILE: '/user/me',
        UPDATE_PROFILE: '/user/me',
        ADDRESSES: '/user/me/addresses',
        ADDRESS: '/user/me/addresses',
    },
    // Product endpoints
    PRODUCTS: {
        LIST: '/products',
        DETAIL: '/products',
        SEARCH: '/products/search',
    },
    // Category endpoints
    CATEGORIES: {
        LIST: '/categories',
        DETAIL: '/categories',
    },
    // Cart endpoints
    CART: {
        GET: '/cart',
        ADD: '/cart/add',
        UPDATE: '/cart/update',
        REMOVE: '/cart/remove',
        CLEAR: '/cart/clear',
    },
    // Order endpoints
    ORDERS: {
        CREATE: '/orders',
        LIST: '/orders',
        DETAIL: '/orders',
        CANCEL: '/orders',
    },
    // Coupon endpoints
    COUPONS: {
        VALIDATE: '/coupons/validate',
        APPLY: '/coupons/apply',
    },
    // Payment endpoints
    PAYMENT: {
        INITIATE: '/payment/initiate',
        CALLBACK: '/payment/callback',
    },
    // eBook endpoints
    EBOOK: {
        LIST: '/ebook/my-books',
        VIEW: '/ebook/view',
        ACCESS: '/ebook/access',
    },
    // Affiliate endpoints
    AFFILIATE: {
        REGISTER: '/affiliate/register',
        DASHBOARD: '/affiliate/dashboard',
        COMMISSIONS: '/affiliate/commissions',
        WITHDRAW: '/affiliate/withdraw',
    },
    // Admin endpoints
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        PRODUCTS: '/admin/products',
        ORDERS: '/admin/orders',
        AFFILIATES: '/admin/affiliates',
    },
    // Upload endpoints
    UPLOAD: {
        SINGLE_IMAGE: '/upload/image',
        MULTIPLE_IMAGES: '/upload/images',
    },
};

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    THEME: 'theme',
    LANGUAGE: 'language',
    CART: 'cart_data',
};

// User Roles
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100,
};

// Product Types
export const PRODUCT_TYPES = {
    PHYSICAL: 'physical',
    DIGITAL: 'digital',
};

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
};

// Payment Methods
export const PAYMENT_METHODS = {
    SSLCOMMERZ: 'sslcommerz',
    BKASH: 'bkash',
    NAGAD: 'nagad',
    COD: 'cod',
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized. Please login.',
    NOT_FOUND: 'Resource not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    REGISTER_SUCCESS: 'Registration successful!',
    PROFILE_UPDATE: 'Profile updated successfully!',
    ORDER_PLACED: 'Order placed successfully!',
};

// App Configuration
export const APP_CONFIG = {
    NAME: 'eBook Store',
    VERSION: '1.0.0',
    SUPPORT_EMAIL: 'support@ebookstore.com',
    SUPPORT_PHONE: '+880-1234-567890',
};

