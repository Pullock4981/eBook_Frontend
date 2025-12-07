/**
 * Secure PDF Viewer Component with PDF.js
 * 
 * Enhanced PDF viewer with better security and control
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function SecurePDFViewer({ pdfURL, accessToken }) {
    const { t } = useTranslation();
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

                // Fetch PDF with access token (token is in URL query)
                const response = await fetch(pdfURL, {
                    credentials: 'include',
                    mode: 'cors',
                });

                if (!response.ok) {
                    throw new Error('Failed to load PDF');
                }

                const arrayBuffer = await response.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

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

    // Render PDF page
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        const renderPage = async () => {
            try {
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

                await page.render(renderContext).promise;
            } catch (err) {
                console.error('Page rendering error:', err);
                setError('Failed to render PDF page');
            }
        };

        renderPage();
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
            <div className="flex items-center justify-center h-full min-h-[600px] bg-base-200 rounded-lg">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-semibold text-error mb-2">{error}</p>
                    <p className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                        {t('ebook.pdfLoadError') || 'Please try again or contact support if the problem persists.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full bg-base-200 rounded-lg overflow-hidden" style={{ userSelect: 'none' }}>
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-base-200 z-10">
                    <div className="text-center">
                        <span className="loading loading-spinner loading-lg"></span>
                        <p className="mt-4 text-sm opacity-70" style={{ color: '#2d3748' }}>
                            {t('ebook.loadingPDF') || 'Loading PDF...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            {pdfDoc && !isLoading && (
                <div className="absolute top-0 left-0 right-0 bg-base-100 bg-opacity-90 backdrop-blur-sm border-b border-base-300 z-20 p-2 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToPrevPage}
                            disabled={pageNum <= 1}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.previousPage') || 'Previous Page'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium px-2">
                            {pageNum} / {numPages}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={pageNum >= numPages}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.nextPage') || 'Next Page'}
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
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                            </svg>
                        </button>
                        <span className="text-sm font-medium px-2">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={zoomIn}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.zoomIn') || 'Zoom In'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                            </svg>
                        </button>
                        <button
                            onClick={rotate}
                            className="btn btn-sm btn-ghost"
                            title={t('ebook.rotate') || 'Rotate'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* PDF Canvas */}
            <div className="overflow-auto w-full h-full" style={{ paddingTop: pdfDoc ? '60px' : '0' }}>
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
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                    />
                </div>
            </div>

            {/* Security Notice */}
            <div className="absolute bottom-0 left-0 right-0 bg-base-100 bg-opacity-90 backdrop-blur-sm border-t border-base-300 z-20 p-2">
                <p className="text-xs text-center opacity-70" style={{ color: '#2d3748' }}>
                    {t('ebook.securityNotice') || 'This eBook is protected. Downloading, copying, or sharing is not allowed.'}
                </p>
            </div>
        </div>
    );
}

export default SecurePDFViewer;

