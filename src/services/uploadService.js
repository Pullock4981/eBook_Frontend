/**
 * Upload Service
 * 
 * Service for handling file uploads
 */

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Upload single image
 * @param {File} file - Image file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} API response
 */
export const uploadSingleImage = async (file, onProgress) => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/image', formData, {
            headers: {
                // Don't set Content-Type - axios will set it automatically with boundary
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
            timeout: 45000, // 45 seconds for image uploads (optimized)
        });

        return response;
    } catch (error) {
        console.error('Upload Single Image Error:', error);
        throw error;
    }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} API response
 */
export const uploadMultipleImages = async (files, onProgress) => {
    try {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        const response = await api.post('/upload/images', formData, {
            headers: {
                // Don't set Content-Type - axios will set it automatically with boundary
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            },
            timeout: 90000, // 90 seconds for multiple image uploads (optimized)
        });

        return response;
    } catch (error) {
        console.error('Upload Multiple Images Error:', error);
        throw error;
    }
};

