/**
 * PDF Upload Component
 * 
 * Drag & drop PDF upload component with progress indicator
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

function PDFUpload({ onUploadSuccess, onUploadError, maxSizeMB = 50, existingUrl = '' }) {
    const { t } = useTranslation();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(existingUrl);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

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

            const response = await api.post('/upload/pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            if (response.data?.success && response.data?.data) {
                const pdfUrl = response.data.data.secure_url || response.data.data.url;
                setPreviewUrl(pdfUrl);
                if (onUploadSuccess) {
                    onUploadSuccess(pdfUrl, response.data.data);
                }
            } else {
                throw new Error(response.data?.message || 'Upload failed');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || t('admin.errors.uploadFailed') || 'Failed to upload PDF';
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
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onUploadSuccess) {
            onUploadSuccess('', null);
        }
    };

    return (
        <div className="w-full">
            {previewUrl ? (
                <div className="border-2 border-success rounded-lg p-4 bg-base-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                                    {t('admin.pdfUploaded') || 'PDF Uploaded Successfully'}
                                </p>
                                <p className="text-xs opacity-70 truncate max-w-xs" style={{ color: '#2d3748' }}>
                                    {previewUrl}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="btn btn-sm btn-ghost text-error hover:bg-error hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-all
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
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <span className="loading loading-spinner loading-lg text-primary"></span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>
                                    {t('admin.uploadingPDF') || 'Uploading PDF...'}
                                </p>
                                <progress
                                    className="progress progress-primary w-full max-w-xs"
                                    value={uploadProgress}
                                    max="100"
                                ></progress>
                                <p className="text-xs mt-1 opacity-70" style={{ color: '#2d3748' }}>
                                    {uploadProgress}%
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <svg
                                    className="w-12 h-12 sm:w-16 sm:h-16"
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
                                <p className="text-sm sm:text-base font-semibold mb-1" style={{ color: '#1E293B' }}>
                                    {t('admin.clickOrDragPDF') || 'Click or drag PDF file here'}
                                </p>
                                <p className="text-xs sm:text-sm opacity-70" style={{ color: '#2d3748' }}>
                                    {t('admin.pdfUploadHint', { maxSize: maxSizeMB }) || `PDF files only (Max ${maxSizeMB}MB)`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-3 alert alert-error py-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs sm:text-sm">{error}</span>
                </div>
            )}
        </div>
    );
}

export default PDFUpload;

