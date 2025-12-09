/**
 * Theme Colors Utility
 * 
 * Provides theme-aware color values for buttons and text
 */

/**
 * Get button background color based on theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {string} - Hex color code
 */
export const getButtonColor = (theme) => {
    return theme === 'dark' ? '#6B8E6B' : '#1E293B';
};

/**
 * Get button text color based on theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {string} - Hex color code
 */
export const getButtonTextColor = (theme) => {
    return '#FFFFFF'; // White text for both themes
};

/**
 * Get primary text color based on theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {string} - Hex color code
 */
export const getPrimaryTextColor = (theme) => {
    return theme === 'dark' ? '#F1F5F9' : '#1E293B';
};

/**
 * Get secondary text color based on theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {string} - Hex color code
 */
export const getSecondaryTextColor = (theme) => {
    return theme === 'dark' ? '#CBD5E1' : '#2d3748';
};

/**
 * Get background color based on theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {string} - Hex color code
 */
export const getBackgroundColor = (theme) => {
    return theme === 'dark' ? '#1E293B' : '#EFECE3';
};

/**
 * Get error color (same for both themes)
 * @returns {string} - Hex color code
 */
export const getErrorColor = () => {
    return '#ef4444'; // Red-500
};

/**
 * Get success color (same for both themes)
 * @returns {string} - Hex color code
 */
export const getSuccessColor = () => {
    return '#22c55e'; // Green-500
};

/**
 * Get warning color (same for both themes)
 * @returns {string} - Hex color code
 */
export const getWarningColor = () => {
    return '#f59e0b'; // Amber-500
};

/**
 * Get info color (same for both themes)
 * @returns {string} - Hex color code
 */
export const getInfoColor = () => {
    return '#3b82f6'; // Blue-500
};

