/**
 * Helper Functions
 * 
 * This file contains utility functions used throughout the application.
 * These functions provide common functionality like formatting, validation, etc.
 */

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: BDT)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'BDT') => {
    if (!amount && amount !== 0) return 'N/A';

    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format date
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type (short, long, time)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return 'N/A';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
    };

    return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(dateObj);
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Validate mobile number (Bangladesh format)
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} True if valid
 */
export const validateMobile = (mobile) => {
    const re = /^(\+880|880|0)?1[3-9]\d{8}$/;
    return re.test(mobile);
};

/**
 * Format mobile number for display
 * @param {string} mobile - Mobile number to format
 * @returns {string} Formatted mobile number (for display)
 */
export const formatMobile = (mobile) => {
    if (!mobile) return '';
    // Remove all non-digits
    const digits = mobile.replace(/\D/g, '');
    // Format as +8801XXXXXXXXX
    if (digits.length === 11 && digits.startsWith('01')) {
        return '+880' + digits.substring(1);
    }
    if (digits.length === 13 && digits.startsWith('880')) {
        return '+' + digits;
    }
    return mobile;
};

/**
 * Normalize mobile number for API (11 digits: 01XXXXXXXXX)
 * Backend expects exactly 11 digits starting with 01
 * @param {string} mobile - Mobile number to normalize
 * @returns {string} Normalized mobile number (11 digits)
 */
export const normalizeMobileForAPI = (mobile) => {
    if (!mobile) return '';
    // Remove all non-digits
    const digits = mobile.replace(/\D/g, '');

    // Convert to 11-digit format (01XXXXXXXXX)
    if (digits.length === 11 && digits.startsWith('01')) {
        return digits; // Already in correct format
    }
    if (digits.length === 13 && digits.startsWith('880')) {
        return '0' + digits.substring(2); // 8801XXXXXXXXX -> 01XXXXXXXXX
    }
    if (digits.length === 14 && digits.startsWith('880')) {
        return '0' + digits.substring(3); // +8801XXXXXXXXX -> 01XXXXXXXXX
    }

    // If already 11 digits, return as is
    if (digits.length === 11) {
        return digits;
    }

    // Return original if can't normalize
    return mobile;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Get error message from error object
 * @param {Error|Object} error - Error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
    if (!error) return 'An error occurred';

    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
};

/**
 * Get stored token
 * @returns {string|null} Auth token
 */
export const getToken = () => {
    return localStorage.getItem('auth_token');
};

/**
 * Set token in localStorage
 * @param {string} token - Auth token
 */
export const setToken = (token) => {
    if (token) {
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
};

/**
 * Get user data from localStorage
 * @returns {Object|null} User data
 */
export const getUserData = () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
};

/**
 * Set user data in localStorage
 * @param {Object} userData - User data
 */
export const setUserData = (userData) => {
    if (userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
    } else {
        localStorage.removeItem('user_data');
    }
};

/**
 * Clear all auth data
 */
export const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
};

/**
 * Generate random ID
 * @returns {string} Random ID
 */
export const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
export const calculateDiscount = (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice) return 0;
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

