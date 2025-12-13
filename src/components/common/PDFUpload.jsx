/**
 * PDF Upload Component
 * 
 * Drag & drop PDF upload component with progress indicator
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

function PDFUpload({ onUploadSuccess, onUploadError, maxSizeMB = 50, existingUrl = '' }) {
    const { t } = useTranslation();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(existingUrl || '');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Update preview when existingUrl changes
    useEffect(() => {
        if (existingUrl) {
            setPreviewUrl(existingUrl);
        }
    }, [existingUrl]);

    const handleFileSelect = async (file) => {
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            setError(t('admin.errors.invalidPDFFile') || 'Please select a valid PDF file');
            return;
        }

        // Validate file size
        const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
        if (file.size > maxSize) {
            setError(t('admin.errors.fileTooLarge', { maxSize: maxSizeMB }) || `File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setError('');
        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            // Don't set Content-Type header - let axios set it automatically with boundary
            const response = await api.post('/upload/pdf', formData, {
                headers: {
                    // Remove Content-Type - axios will set it automatically with boundary for FormData
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    }
                },
                timeout: 120000, // 2 minutes for large PDF files
            });

            // API interceptor returns response.data directly, so response is already the data object
            console.log('PDF Upload Response (Full):', JSON.stringify(response, null, 2));
            console.log('PDF Upload Response Type:', typeof response);
            console.log('PDF Upload Response Keys:', response ? Object.keys(response) : 'null');
            
            // Handle different response structures
            let uploadData = null;
            let pdfUrl = null;
            
            if (response) {
                // Structure 1: { success: true, data: { secure_url: ..., url: ..., public_id: ... } }
                if (response.success && response.data) {
                    uploadData = response.data;
                    pdfUrl = uploadData.secure_url || uploadData.url || uploadData.path;
                    
                    // If URL not found but public_id exists, construct URL
                    if (!pdfUrl && uploadData.public_id) {
                        // Try to construct Cloudinary URL from public_id
                        const publicId = uploadData.public_id;
                        pdfUrl = `https://res.cloudinary.com/${publicId.split('/')[0]}/raw/upload/${publicId}`;
                        console.log('Constructed URL from public_id:', pdfUrl);
                    }
                    
                    console.log('Found URL in response.data:', pdfUrl);
                } 
                // Structure 2: Response is the data object directly { secure_url: ..., url: ..., public_id: ... }
                else if (response.secure_url || response.url || response.path || response.public_id) {
                    uploadData = response;
                    pdfUrl = response.secure_url || response.url || response.path;
                    
                    // If URL not found but public_id exists, construct URL
                    if (!pdfUrl && response.public_id) {
                        const publicId = response.public_id;
                        pdfUrl = `https://res.cloudinary.com/${publicId.split('/')[0]}/raw/upload/${publicId}`;
                        console.log('Constructed URL from public_id:', pdfUrl);
                    }
                    
                    console.log('Found URL in response directly:', pdfUrl);
                }
                // Structure 3: Nested data { data: { secure_url: ..., url: ..., public_id: ... } }
                else if (response.data) {
                    uploadData = response.data;
                    pdfUrl = response.data.secure_url || response.data.url || response.data.path;
                    
                    // If URL not found but public_id exists, construct URL
                    if (!pdfUrl && response.data.public_id) {
                        const publicId = response.data.public_id;
                        pdfUrl = `https://res.cloudinary.com/${publicId.split('/')[0]}/raw/upload/${publicId}`;
                        console.log('Constructed URL from public_id:', pdfUrl);
                    }
                    
                    console.log('Found URL in nested response.data:', pdfUrl);
                }
            }
            
            console.log('Final Extracted PDF URL:', pdfUrl);
            console.log('Final Extracted Upload Data:', uploadData);
            
            if (pdfUrl) {
                setPreviewUrl(pdfUrl);
                setUploadedFileName(file.name);
                setError(''); // Clear any previous errors
                
                if (onUploadSuccess) {
                    onUploadSuccess(pdfUrl, uploadData || { secure_url: pdfUrl, url: pdfUrl });
                }
            } else {
                // More detailed error message
                const responseStr = JSON.stringify(response, null, 2);
                console.error('PDF URL not found. Full response structure:', responseStr);
                console.error('Response has success?', response?.success);
                console.error('Response has data?', !!response?.data);
                console.error('Response.data keys:', response?.data ? Object.keys(response.data) : 'N/A');
                
                throw new Error(`PDF URL not found in response. Response structure: ${responseStr.substring(0, 200)}...`);
            }
        } catch (err) {
            console.error('PDF Upload Error:', err);
            console.error('Error Details:', {
                message: err.message,
                response: err.response,
                data: err.data,
                status: err.status,
                code: err.code
            });
            
            // Better error handling
            let errorMessage = t('admin.errors.uploadFailed') || 'Failed to upload PDF';
            
            // Check different error sources
            if (err.data?.message) {
                errorMessage = err.data.message;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            // Specific error messages
            if (err.status === 401) {
                errorMessage = 'Authentication failed. Please login again.';
            } else if (err.status === 403) {
                errorMessage = 'You do not have permission to upload files. Admin access required.';
            } else if (err.status === 404) {
                errorMessage = 'Upload endpoint not found. Please check backend server.';
            } else if (err.status >= 500) {
                errorMessage = 'Server error. Please try again later or contact support.';
            } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
                errorMessage = 'Upload timeout. File might be too large. Please try a smaller file or check your connection.';
            } else if (err.message?.includes('Network') || err.message?.includes('connection') || err.status === 0) {
                errorMessage = 'Network error. Please check your internet connection and ensure backend server is running.';
            }
            
            setError(errorMessage);
            if (onUploadError) {
                onUploadError(err);
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleRemove = () => {
        setPreviewUrl('');
        setUploadedFileName('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onUploadSuccess) {
            onUploadSuccess('', null);
        }
    };

    const handleAddMore = () => {
        // Reset to allow uploading again
        setPreviewUrl('');
        setUploadedFileName('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Clear the uploaded file from parent component
        if (onUploadSuccess) {
            onUploadSuccess('', null);
        }
    };

    return (
        <div className="w-full">
            {previewUrl ? (
                <div className="space-y-2 sm:space-y-3">
                    <div className="border-2 border-success rounded-lg p-2 sm:p-3 md:p-4 bg-base-100">
                        <div className="flex flex-col gap-2 sm:gap-3">
                            {/* Main Content */}
                            <div className="flex items-start gap-2 sm:gap-3">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm md:text-base font-semibold mb-1" style={{ color: '#1E293B' }}>
                                        {t('admin.pdfUploaded') || 'PDF Uploaded Successfully'}
                                    </p>
                                    {uploadedFileName && (
                                        <p className="text-xs sm:text-sm font-medium mb-1 break-words" style={{ color: '#059669' }}>
                                            {uploadedFileName}
                                        </p>
                                    )}
                                    <a 
                                        href={previewUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs sm:text-sm opacity-70 hover:opacity-100 break-all text-blue-600 hover:text-blue-800 underline block"
                                    >
                                        {previewUrl}
                                    </a>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 sm:gap-2 justify-start sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleAddMore}
                                    className="btn btn-xs sm:btn-sm btn-outline btn-success flex-shrink-0 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                                    title={t('admin.addMorePDF') || 'Upload Another PDF'}
                                >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="ml-1">{t('admin.addMore') || 'Add More'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="btn btn-xs sm:btn-sm btn-ghost text-error hover:bg-error hover:text-white flex-shrink-0 h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                                    title={t('admin.removePDF') || 'Remove PDF'}
                                >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="hidden sm:inline ml-1">{t('common.remove') || 'Remove'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* PDF Preview/View Link */}
                    <div className="flex justify-center">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs sm:btn-sm btn-outline btn-primary h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
                        >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {t('admin.viewPDF') || 'View PDF'}
                        </a>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-all
                        ${isDragging ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-100'}
                        ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary hover:bg-base-200'}
                    `}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleInputChange}
                        className="hidden"
                        disabled={uploading}
                    />

                    {uploading ? (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-center">
                                <span className="loading loading-spinner loading-md sm:loading-lg text-primary"></span>
                            </div>
                            <div className="w-full max-w-xs mx-auto">
                                <p className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>
                                    {t('admin.uploadingPDF') || 'Uploading PDF...'}
                                </p>
                                <progress
                                    className="progress progress-primary w-full"
                                    value={uploadProgress}
                                    max="100"
                                ></progress>
                                <p className="text-xs mt-1 opacity-70" style={{ color: '#2d3748' }}>
                                    {uploadProgress}%
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-center">
                                <svg
                                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: '#94a3b8' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm md:text-base font-semibold mb-1" style={{ color: '#1E293B' }}>
                                    {t('admin.clickOrDragPDF') || 'Click or drag PDF file here'}
                                </p>
                                <p className="text-xs sm:text-sm opacity-70 px-2" style={{ color: '#2d3748' }}>
                                    {t('admin.pdfUploadHint', { maxSize: maxSizeMB }) || `PDF files only (Max ${maxSizeMB}MB)`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-2 sm:mt-3 alert alert-error py-2 px-3 sm:px-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs sm:text-sm break-words">{error}</span>
                </div>
            )}
        </div>
    );
}

export default PDFUpload;

