/**
 * Secure PDF Viewer Component with PDF.js
 * 
 * Enhanced PDF viewer with better security and control
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import pdfjsLib from '../../utils/pdfjsConfig'; // Import configured PDF.js
import { useThemeColors } from '../../hooks/useThemeColors';
import { API_BASE_URL } from '../../utils/constants';
import { getToken } from '../../utils/helpers';

function SecurePDFViewer({ pdfURL, accessToken }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, infoColor } = useThemeColors();
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1.5);
    const [rotation, setRotation] = useState(0);

    // Security: Disable right-click, copy, download
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        const handleSelectStart = (e) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e) => {
            // Disable Ctrl+S (Save)
            if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+P (Print)
            if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+A (Select All)
            if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+C (Copy)
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                return false;
            }
            // Disable F12 (Developer Tools)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            // Disable Print Screen (limited effectiveness)
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                return false;
            }
        };

        // Disable drag and drop
        const handleDragStart = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable image context menu
        const handleImageContextMenu = (e) => {
            if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('contextmenu', handleImageContextMenu, true);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('contextmenu', handleImageContextMenu, true);
        };
    }, []);

    // Load PDF document
    useEffect(() => {
        if (!pdfURL) return;

        const loadPDF = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch PDF with credentials (for authentication)
                console.log('📄 SecurePDFViewer - Loading PDF from URL:', pdfURL);
                const token = getToken();
                const headers = {};

                // Check if URL is external (e.g., Cloudinary)
                // If it starts with API_BASE_URL, it's INTERNAL (even if it's absolute)
                const isInternalAPI = pdfURL.startsWith(API_BASE_URL) || (!pdfURL.startsWith('http://') && !pdfURL.startsWith('https://'));
                const isExternal = !isInternalAPI;
                let fetchOptions = {};

                if (isExternal) {
                    console.log('📄 SecurePDFViewer - External URL detected (Cloudinary/S3). Skipping auth headers to prevent CORS issues.');
                    // For external URLs like Cloudinary, we don't send our app's auth token
                    // and we don't use credentials: 'include' as it requires Access-Control-Allow-Credentials: true
                    fetchOptions = {
                        mode: 'cors',
                        credentials: 'omit', // Important for Cloudinary/S3 public or signed URLs
                        headers: {}
                    };
                } else {
                    // Internal API URL - Send Auth Token
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                        console.log('📄 SecurePDFViewer - Using auth token for internal API');
                    }
                    fetchOptions = {
                        credentials: 'include',
                        mode: 'cors',
                        headers: headers
                    };
                }

                const response = await fetch(pdfURL, fetchOptions);

                if (!response.ok) {
                    // Try to get error message from response
                    let errorMessage = `Failed to load PDF: ${response.status} ${response.statusText}`;
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        // If response is not JSON, use default message
                    }
                    console.error('PDF fetch failed:', {
                        status: response.status,
                        statusText: response.statusText,
                        url: pdfURL,
                        errorMessage
                    });
                    throw new Error(errorMessage);
                }

                // Check if response is actually a PDF
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/pdf')) {
                    console.warn('PDF response content-type:', contentType, 'Expected: application/pdf');
                    // Still try to load it - might be a proxy that doesn't set content-type correctly
                }

                const arrayBuffer = await response.arrayBuffer();
                console.log('PDF loaded, arrayBuffer size:', arrayBuffer.byteLength);

                // Load PDF document (worker is already configured in pdfjsConfig.js)
                const loadingTask = pdfjsLib.getDocument({
                    data: arrayBuffer,
                    verbosity: 0 // Reduce console noise
                });
                const pdf = await loadingTask.promise;
                console.log('PDF document loaded, pages:', pdf.numPages);

                setPdfDoc(pdf);
                setNumPages(pdf.numPages);
                setIsLoading(false);
            } catch (err) {
                console.error('PDF loading error:', err);
                setError(err.message || 'Failed to load PDF');
                setIsLoading(false);
            }
        };

        loadPDF();
    }, [pdfURL, accessToken]);

    const renderTaskRef = useRef(null);

    // Render PDF page
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        const renderPage = async () => {
            try {
                // Cancel previous render task if it exists
                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel();
                }

                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale, rotation });

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask;

                await renderTask.promise;
                renderTaskRef.current = null;
            } catch (err) {
                if (err.name === 'RenderingCancelledException') {
                    console.log('Rendering cancelled (new render started)');
                    return;
                }
                console.error('Page rendering error:', err);
                setError('Failed to render PDF page');
            }
        };

        renderPage();

        return () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        };
    }, [pdfDoc, pageNum, scale, rotation]);

    const goToPrevPage = () => {
        if (pageNum > 1) {
            setPageNum(pageNum - 1);
        }
    };

    const goToNextPage = () => {
        if (pageNum < numPages) {
            setPageNum(pageNum + 1);
        }
    };

    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const rotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[600px] rounded-lg" style={{ backgroundColor: secondaryTextColor + '20' }}>
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#EF4444' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-semibold mb-2" style={{ color: '#EF4444' }}>{error}</p>
                    <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                        {t('ebook.pdfLoadError') || 'Please try again or contact support if the problem persists.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full rounded-lg overflow-hidden" style={{ userSelect: 'none', backgroundColor: secondaryTextColor + '10' }}>
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10" style={{ backgroundColor: secondaryTextColor + '20' }}>
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="mt-4 text-sm opacity-70" style={{ color: secondaryTextColor }}>
                            {t('ebook.loadingPDF') || 'Loading PDF...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            {pdfDoc && !isLoading && (
                <div className="absolute top-0 left-0 right-0 bg-opacity-90 backdrop-blur-sm border-b z-20 p-2 flex items-center justify-between flex-wrap gap-2" style={{ backgroundColor: backgroundColor + 'E6', borderColor: secondaryTextColor }}>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToPrevPage}
                            disabled={pageNum <= 1}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.previousPage') || 'Previous Page'}
                            style={{ color: primaryTextColor }}
                            onMouseEnter={(e) => {
                                if (pageNum > 1) {
                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '30';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium px-2" style={{ color: primaryTextColor }}>
                            {pageNum} / {numPages}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={pageNum >= numPages}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.nextPage') || 'Next Page'}
                            style={{ color: primaryTextColor }}
                            onMouseEnter={(e) => {
                                if (pageNum < numPages) {
                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '30';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={zoomOut}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.zoomOut') || 'Zoom Out'}
                            style={{ color: primaryTextColor }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = secondaryTextColor + '30';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium px-2" style={{ color: primaryTextColor }}>
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={zoomIn}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.zoomIn') || 'Zoom In'}
                            style={{ color: primaryTextColor }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = secondaryTextColor + '30';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                            </svg>
                        </button>
                        <button
                            onClick={rotate}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.rotate') || 'Rotate'}
                            style={{ color: primaryTextColor }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = secondaryTextColor + '30';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* PDF Canvas */}
            <div className="overflow-auto w-full h-full" style={{ paddingTop: pdfDoc ? '60px' : '0', backgroundColor: '#ffffff' }}>
                <div className="flex justify-center items-center min-h-full p-4">
                    <canvas
                        ref={canvasRef}
                        className="shadow-lg"
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            pointerEvents: 'none', // Prevent selection
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            userSelect: 'none',
                            backgroundColor: '#ffffff', // PDF canvas should always be white
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                    />
                </div>
            </div>

            {/* Security Notice */}
            <div className="absolute bottom-0 left-0 right-0 bg-opacity-90 backdrop-blur-sm border-t z-20 p-2" style={{ backgroundColor: backgroundColor + 'E6', borderColor: secondaryTextColor }}>
                <p className="text-xs text-center opacity-70" style={{ color: secondaryTextColor }}>
                    {t('ebook.securityNotice') || 'This eBook is protected. Downloading, copying, or sharing is not allowed.'}
                </p>
            </div>
        </div>
    );
}

export default SecurePDFViewer;

