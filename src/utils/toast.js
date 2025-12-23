/**
 * Toast Utility
 * Centralized toast notification helpers
 */

import toast from 'react-hot-toast';

/**
 * Show success toast
 */
export const showSuccess = (message) => {
    return toast.success(message, {
        duration: 3000,
    });
};

/**
 * Show error toast
 */
export const showError = (message) => {
    return toast.error(message, {
        duration: 4000,
    });
};

/**
 * Show info toast
 */
export const showInfo = (message) => {
    return toast(message, {
        duration: 3000,
        icon: 'ℹ️',
    });
};

/**
 * Show loading toast
 */
export const showLoading = (message) => {
    return toast.loading(message);
};

/**
 * Dismiss toast
 */
export const dismissToast = (toastId) => {
    toast.dismiss(toastId);
};

