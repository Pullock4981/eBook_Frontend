/**
 * Image Upload Component
 * 
 * Component for uploading images with preview
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { uploadSingleImage, uploadMultipleImages } from '../../services/uploadService';

function ImageUpload({
    images = [],
    onImagesChange,
    multiple = false,
    maxImages = 10,
    label = 'Upload Images'
}) {
    const { t } = useTranslation();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        // Validate file count
        if (multiple) {
            if (images.length + files.length > maxImages) {
                setError(`Maximum ${maxImages} images allowed`);
                return;
            }
        } else {
            if (files.length > 1) {
                setError('Please select only one image');
                return;
            }
        }

        // Validate file types and sizes
        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        try {
            let uploadedImages = [];

            if (multiple) {
                const response = await uploadMultipleImages(validFiles, (progress) => {
                    setUploadProgress(progress);
                });
                console.log('Multiple Images Upload Response (Full):', JSON.stringify(response, null, 2));
                console.log('Multiple Images Upload Response Type:', typeof response);
                console.log('Multiple Images Upload Response Keys:', response ? Object.keys(response) : 'null');
                
                // API interceptor returns response.data directly, so response is already the data object
                // Structure: { success: true, data: [...] } or { success: true, data: {...} }
                if (response) {
                    if (response.success && response.data) {
                        // Standard structure: { success: true, data: [...] }
                        uploadedImages = Array.isArray(response.data) ? response.data : [response.data];
                        console.log('Found images in response.data:', uploadedImages);
                    } else if (Array.isArray(response)) {
                        // Direct array response
                        uploadedImages = response;
                        console.log('Found images as direct array:', uploadedImages);
                    } else if (response.data && Array.isArray(response.data)) {
                        // Nested data array
                        uploadedImages = response.data;
                        console.log('Found images in nested response.data:', uploadedImages);
                    } else if (response.data) {
                        // Single object in data
                        uploadedImages = [response.data];
                        console.log('Found single image in response.data:', uploadedImages);
                    } else if (response.secure_url || response.url) {
                        // Direct image object
                        uploadedImages = [response];
                        console.log('Found image as direct object:', uploadedImages);
                    }
                }
            } else {
                const response = await uploadSingleImage(validFiles[0], (progress) => {
                    setUploadProgress(progress);
                });
                console.log('Single Image Upload Response (Full):', JSON.stringify(response, null, 2));
                console.log('Single Image Upload Response Type:', typeof response);
                console.log('Single Image Upload Response Keys:', response ? Object.keys(response) : 'null');
                
                // API interceptor returns response.data directly
                // Structure: { success: true, data: {...} }
                if (response) {
                    if (response.success && response.data) {
                        // Standard structure: { success: true, data: {...} }
                        uploadedImages = [response.data];
                        console.log('Found image in response.data:', uploadedImages);
                    } else if (response.secure_url || response.url) {
                        // Direct image object
                        uploadedImages = [response];
                        console.log('Found image as direct object:', uploadedImages);
                    } else if (response.data) {
                        // Nested data
                        uploadedImages = [response.data];
                        console.log('Found image in nested response.data:', uploadedImages);
                    } else {
                        // Try as is
                        uploadedImages = [response];
                        console.log('Using response as-is:', uploadedImages);
                    }
                }
            }

            console.log('Extracted Uploaded Images:', uploadedImages);

            // Extract URLs from uploaded images
            const imageUrls = uploadedImages
                .map((img, idx) => {
                    if (!img) {
                        console.warn(`Image at index ${idx} is null/undefined`);
                        return null;
                    }
                    
                    if (typeof img === 'string') {
                        console.log(`Image ${idx} is string:`, img);
                        return img;
                    }
                    
                    // Try to get URL from various possible fields
                    let url = img.secure_url || img.url || img.path;
                    
                    // If URL not found but public_id exists, construct Cloudinary URL
                    if (!url && img.public_id) {
                        // Extract cloud name from public_id or use default
                        const publicId = img.public_id;
                        // Try to construct URL: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
                        // For now, we'll need the cloud name, but let's try a generic approach
                        url = `https://res.cloudinary.com/${publicId.split('/')[0] || 'dbnmcsoch'}/image/upload/${publicId}`;
                        console.log(`Constructed URL from public_id for image ${idx}:`, url);
                    }
                    
                    console.log(`Image ${idx} extracted URL:`, url, 'from object:', img);
                    return url;
                })
                .filter(url => url !== null && url !== undefined && url !== '');

            console.log('Extracted Image URLs:', imageUrls);
            console.log('Image URLs count:', imageUrls.length);

            if (imageUrls.length === 0) {
                console.error('No image URLs found. Full response structure:', JSON.stringify(uploadedImages, null, 2));
                throw new Error('No image URLs found in response. Please check backend configuration and Cloudinary setup.');
            }

            // Add new images to existing ones
            const newImages = multiple
                ? [...images, ...imageUrls]
                : imageUrls;

            console.log('Final Images Array:', newImages);
            onImagesChange(newImages);
            setUploadProgress(0);
        } catch (error) {
            console.error('Image Upload Error:', error);
            console.error('Error Details:', {
                message: error.message,
                response: error.response,
                data: error.data,
                status: error.status
            });
            setError(error.message || error.data?.message || 'Failed to upload images');
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const event = {
                target: { files: files }
            };
            handleFileSelect(event);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className="border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center cursor-pointer hover:border-primary transition-all hover:bg-base-50"
                style={{
                    borderColor: uploading ? '#1E293B' : '#cbd5e1',
                    backgroundColor: uploading ? '#f8f9fa' : 'transparent'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center">
                            <span className="loading loading-spinner loading-lg" style={{ color: '#1E293B' }}></span>
                            <p className="text-base font-medium mt-4" style={{ color: '#1E293B' }}>
                                {t('admin.uploading') || 'Uploading...'} {uploadProgress}%
                            </p>
                            <div className="w-64 max-w-full mt-2">
                                <progress
                                    className="progress progress-primary w-full"
                                    value={uploadProgress}
                                    max="100"
                                    style={{ backgroundColor: '#e2e8f0' }}
                                ></progress>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                                <svg
                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: '#1E293B' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm sm:text-base font-semibold mb-1" style={{ color: '#1E293B' }}>
                                {t('admin.clickOrDrag') || 'Click or drag images here to upload'}
                            </p>
                            <p className="text-xs sm:text-sm opacity-70" style={{ color: '#2d3748' }}>
                                {t('admin.maxFileSize') || 'Max file size: 5MB'} • {t('admin.supportedFormats') || 'Supported: JPG, PNG, WebP'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Image Preview */}
            {images.length > 0 && (
                <div className="mt-4 sm:mt-6">
                    <h3 className="text-sm sm:text-base font-semibold mb-3" style={{ color: '#1E293B' }}>
                        {t('admin.uploadedImages') || 'Uploaded Images'} ({images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {images.map((imageUrl, index) => {
                            // Ensure imageUrl is a valid string
                            const validUrl = typeof imageUrl === 'string' ? imageUrl : (imageUrl?.secure_url || imageUrl?.url || '');
                            
                            return (
                                <div key={index} className="relative group">
                                    <div className="aspect-square rounded-lg overflow-hidden border-2 hover:border-primary transition-colors bg-base-200" style={{ borderColor: '#cbd5e1' }}>
                                        {validUrl ? (
                                            <img
                                                src={validUrl}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.error('Image load error:', validUrl);
                                                    e.target.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                                                }}
                                                onLoad={() => {
                                                    console.log('Image loaded successfully:', validUrl);
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-base-200">
                                                <span className="text-xs opacity-50">No Image</span>
                                            </div>
                                        )}
                                    </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute -top-2 -right-2 btn btn-sm btn-circle btn-error shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2">
                                            <span className="badge badge-primary badge-sm text-white">
                                                {t('admin.mainImage') || 'Main'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Image Count */}
            {multiple && images.length > 0 && (
                <p className="text-xs opacity-70 text-center" style={{ color: '#2d3748' }}>
                    {images.length} / {maxImages} {t('admin.images') || 'images'}
                </p>
            )}
        </div>
    );
}

export default ImageUpload;

