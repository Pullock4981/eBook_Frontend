/**
 * PDF Upload Component
 * 
 * Drag & drop PDF upload component with progress indicator
 * Hybrid Strategy: 
 * 1. Direct Cloudinary Upload (Client -> Cloud) for small-medium files (<10MB) - Fastest
 * 2. Server Proxy Upload (Client -> Server -> Cloud) for large files (>10MB) - Bypasses simple signed upload limits
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
    const [uploadStrategy, setUploadStrategy] = useState('auto'); // 'direct' or 'server'
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

        // Common validation
        if (file.type !== 'application/pdf') {
            setError(t('admin.errors.invalidPDFFile') || 'Please select a valid PDF file');
            return;
        }

        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            setError(t('admin.errors.fileTooLarge', { maxSize: maxSizeMB }) || `File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setError('');
        setUploading(true);
        setUploadProgress(0);

        // CLOUDINARY FREE TIER DIRECT UPLOAD LIMIT IS 10MB
        const CLOUDINARY_DIRECT_LIMIT = 10 * 1024 * 1024;

        try {
            let pdfUrl = '';
            let uploadDataResult = null;

            if (file.size <= CLOUDINARY_DIRECT_LIMIT) {
                // ==========================================
                // STRATEGY 1: Direct Upload (Fast, < 10MB)
                // ==========================================
                console.log('File < 10MB. Using Direct Upload strategy.');
                setUploadStrategy('direct');

                // 1. Get Signature
                const signatureResponse = await api.get('/upload/signature');
                if (!signatureResponse.success) throw new Error('Failed to get upload signature');
                const { signature, timestamp, cloudName, apiKey, folder } = signatureResponse;

                // 2. Prepare FormData
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', apiKey);
                formData.append('timestamp', timestamp);
                formData.append('signature', signature);
                formData.append('folder', folder);

                // 3. Upload
                const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
                const uploadResponse = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', cloudinaryUrl);
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded * 100) / e.total));
                    };
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('Invalid JSON')); }
                        } else {
                            try { reject(new Error(JSON.parse(xhr.responseText).error?.message || `Status ${xhr.status}`)); }
                            catch (e) { reject(new Error(`Status ${xhr.status}`)); }
                        }
                    };
                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.send(formData);
                });

                uploadDataResult = uploadResponse;
                pdfUrl = uploadResponse.secure_url || uploadResponse.url;

            } else {
                // ==========================================
                // STRATEGY 2: Server Proxy Upload (Slower, > 10MB)
                // ==========================================
                console.log('File > 10MB. Using Server Proxy strategy.');
                setUploadStrategy('server');

                const formData = new FormData();
                formData.append('pdf', file);

                // Use the API service (axios)
                // Server backend logic uses upload_stream which handles larger files
                const response = await api.post('/upload/pdf', formData, {
                    timeout: 600000, // 10 minutes timeout
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                        }
                    }
                });

                // API service returns response.data directly in success cases
                if (response && (response.secure_url || response.url)) {
                    uploadDataResult = response;
                    pdfUrl = response.secure_url || response.url;
                } else if (response && response.data && (response.data.secure_url || response.data.url)) {
                    uploadDataResult = response.data;
                    pdfUrl = response.data.secure_url || response.data.url;
                } else {
                    console.error('Server response:', response);
                    throw new Error('Server upload succeeded but no URL returned');
                }
            }

            if (pdfUrl) {
                setPreviewUrl(pdfUrl);
                setUploadedFileName(file.name);
                setError('');
                if (onUploadSuccess) {
                    onUploadSuccess(pdfUrl, { ...uploadDataResult, bytes: file.size });
                }
            } else {
                throw new Error('Upload failed: No URL returned');
            }

        } catch (err) {
            console.error('PDF Upload Error:', err);
            let errorMessage = err.message || t('admin.errors.uploadFailed') || 'Upload failed';

            // Helpful message formatting
            if (errorMessage.includes('too large') || errorMessage.includes('413')) {
                errorMessage = `File too large. Max: ${maxSizeMB}MB.`;
            } else if (errorMessage.includes('timeout') || err.code === 'ECONNABORTED') {
                errorMessage = 'Upload timed out. Please check your connection.';
            }

            setError(errorMessage);
            if (onUploadError) {
                const uiError = new Error(errorMessage);
                // @ts-ignore
                uiError.response = { data: { message: errorMessage } };
                onUploadError(uiError);
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
            setUploadStrategy('auto');
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

    return (
        <div className="w-full">
            {previewUrl ? (
                <div className="space-y-3 sm:space-y-4">
                    <div className="border-2 border-success rounded-lg p-4 sm:p-5 md:p-6 bg-base-100 shadow-md">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Main Content */}
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm sm:text-base md:text-lg font-bold mb-2 text-success">
                                        {t('admin.pdfUploaded') || 'PDF Uploaded Successfully'}
                                    </p>
                                    {uploadedFileName && (
                                        <p className="text-xs sm:text-sm font-semibold mb-2 break-words text-slate-800">
                                            {uploadedFileName}
                                        </p>
                                    )}
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs sm:text-sm opacity-80 hover:opacity-100 break-all text-blue-600 hover:text-blue-800 underline transition-opacity block"
                                    >
                                        {previewUrl}
                                    </a>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 sm:gap-3 justify-end mt-3">
                                <button
                                    type="button"
                                    onClick={handleAddMore}
                                    className="btn btn-sm sm:btn-md btn-success text-white hover:bg-green-600 transition-all shadow-md hover:shadow-lg hover:border-green-600"
                                    title={t('admin.addMorePDF') || 'Upload Another PDF'}
                                    style={{
                                        backgroundColor: '#10b981',
                                        borderColor: '#10b981',
                                        minWidth: '120px'
                                    }}
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span className="ml-1 sm:ml-2 font-medium">Add More</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="btn btn-sm sm:btn-md btn-error text-white hover:bg-red-600 transition-all shadow-md hover:shadow-lg hover:border-red-600"
                                    title={t('admin.removePDF') || 'Remove PDF'}
                                    style={{
                                        backgroundColor: '#ef4444',
                                        borderColor: '#ef4444',
                                        minWidth: '120px'
                                    }}
                                >
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="ml-1 sm:ml-2 font-medium">Remove</span>
                                </button>
                            </div>
                        </div>
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
                                <p className="text-xs sm:text-sm font-semibold mb-2 text-slate-800">
                                    {t('admin.uploadingPDF') || 'Uploading PDF...'}
                                </p>
                                <progress
                                    className="progress progress-primary w-full"
                                    value={uploadProgress}
                                    max="100"
                                ></progress>
                                <p className="text-xs mt-1 opacity-70 text-slate-600">
                                    {uploadProgress}%
                                </p>
                                <p className="text-xs mt-1 font-medium text-success">
                                    {uploadStrategy === 'direct'
                                        ? 'Fast direct upload...'
                                        : 'Uploading to server (large file)...'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-center">
                                <svg
                                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
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
                                <p className="text-xs sm:text-sm md:text-base font-semibold mb-1 text-slate-800">
                                    {t('admin.clickOrDragPDF') || 'Click or drag PDF file here'}
                                </p>
                                <p className="text-xs sm:text-sm opacity-70 px-2 text-slate-600">
                                    {t('admin.pdfUploadHint', { maxSize: maxSizeMB }) || `PDF files only (Max ${maxSizeMB}MB)`}
                                </p>
                                <p className="text-xs text-info mt-2">
                                    💡 Tip: &lt; 10MB = Super Fast. &gt; 10MB = Slower (Server Upload).
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-2 sm:mt-3 alert alert-error py-2 px-3 sm:px-4 flex items-start text-left">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs sm:text-sm break-words flex-1 ml-2">{error}</span>
                </div>
            )}
        </div>
    );
}

export default PDFUpload;
