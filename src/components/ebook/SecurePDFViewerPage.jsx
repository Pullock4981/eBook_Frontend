/**
 * Secure PDF Viewer Page Component
 * 
 * Enhanced PDF viewer with:
 * - Online reading only (no download)
 * - Dynamic watermark (User email + Session ID)
 * - Disable right-click, copy & download
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import pdfjsLib from '../../utils/pdfjsConfig'; // Import configured PDF.js
import Loading from '../common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';

function SecurePDFViewerPage({ productId, pdfURL: initialPdfURL }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1.5);
    const [watermarkText, setWatermarkText] = useState('');
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor } = useThemeColors();

    // Generate watermark with user email and session ID
    useEffect(() => {
        if (user) {
            const userEmail = user.profile?.email || user.email || 'user@example.com';
            // Use email with session ID for watermark
            const sessionId = 'SESSION-' + Date.now().toString().slice(-8);
            setWatermarkText(`${userEmail} | ${sessionId}`);
        }
    }, [user]);

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
            // Disable Ctrl+S (Save), Ctrl+P (Print), Ctrl+C (Copy), Ctrl+A (Select All), F12, PrintScreen
            if ((e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'a' || e.key === 'A' || e.key === 'c' || e.key === 'C')) || e.key === 'F12' || e.key === 'PrintScreen') {
                e.preventDefault();
                return false;
            }
        };

        const handleDragStart = (e) => {
            e.preventDefault();
            return false;
        };

        const handleImageContextMenu = (e) => {
            if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
                e.preventDefault();
                return false;
            }
        };

        const handleSelect = (e) => {
            e.preventDefault();
            window.getSelection().removeAllRanges();
            return false;
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('contextmenu', handleImageContextMenu, true);
        document.addEventListener('select', handleSelect);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('dragstart', handleDragStart);
            document.removeEventListener('contextmenu', handleImageContextMenu, true);
            document.removeEventListener('select', handleSelect);
        };
    }, []);

    // Load PDF
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (initialPdfURL) {
            loadPDF(initialPdfURL);
        }
    }, [isAuthenticated, initialPdfURL, navigate]);

    const loadPDF = async (pdfURL) => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch PDF - if it's our API endpoint, include auth token
            const headers = {};
            const token = localStorage.getItem('token');
            if (token && pdfURL.includes('/api/')) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const pdfResponse = await fetch(pdfURL, {
                credentials: 'include',
                mode: 'cors',
                headers: headers
            });

            if (!pdfResponse.ok) {
                throw new Error(`Failed to load PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
            }

            const arrayBuffer = await pdfResponse.arrayBuffer();
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

    // Render PDF page with watermark
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current || pageNum < 1) return;

        const renderPage = async () => {
            try {
                const page = await pdfDoc.getPage(pageNum);
                const viewport = page.getViewport({ scale, rotation: 0 });

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;

                // Add watermark overlay
                if (watermarkText) {
                    context.save();
                    context.globalAlpha = 0.3;
                    context.fillStyle = '#000000';
                    context.font = '16px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';

                    const spacing = 200; // Spacing between watermarks
                    const angle = -45 * Math.PI / 180; // Diagonal angle

                    // Iterate over a grid to place multiple watermarks
                    for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
                        for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
                            context.save();
                            context.translate(x, y);
                            context.rotate(angle);
                            context.fillText(watermarkText, 0, 0);
                            context.restore();
                        }
                    }
                    context.restore();
                }
            } catch (err) {
                console.error('Page render error:', err);
            }
        };

        renderPage();
    }, [pdfDoc, pageNum, scale, watermarkText]);

    const goToPrevPage = () => {
        if (pageNum > 1) {
            setPageNum(pageNum - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToNextPage = () => {
        if (pageNum < numPages) {
            setPageNum(pageNum + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const zoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12" style={{ backgroundColor }}>
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12" style={{ backgroundColor }}>
                <div className="text-center">
                    <div className="alert alert-error mb-4" style={{ backgroundColor: errorColor + '20', borderColor: errorColor }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" style={{ color: errorColor }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span style={{ color: errorColor }}>{error}</span>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-primary text-white"
                        style={{ backgroundColor: buttonColor }}
                    >
                        {t('common.back') || 'Back'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-6" style={{ backgroundColor }}>
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 bg-base-100 rounded-lg shadow-md p-3 mb-4 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <button onClick={goToPrevPage} disabled={pageNum <= 1} className="btn btn-sm btn-ghost" title={t('ebooks.previousPage') || 'Previous Page'} style={{ color: primaryTextColor }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    <span className="hidden sm:inline">{t('ebooks.previousPage') || 'Previous'}</span>
                </button>
                <span className="text-sm font-medium" style={{ color: primaryTextColor }}>
                    {t('common.page') || 'Page'} {pageNum} {t('common.of') || 'of'} {numPages}
                </span>
                <button onClick={goToNextPage} disabled={pageNum >= numPages} className="btn btn-sm btn-ghost" title={t('ebooks.nextPage') || 'Next Page'} style={{ color: primaryTextColor }}>
                    <span className="hidden sm:inline">{t('ebooks.nextPage') || 'Next'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="divider divider-horizontal mx-1" style={{ borderColor: secondaryTextColor }}></div>
                <button onClick={zoomIn} disabled={scale >= 3} className="btn btn-sm btn-ghost" title={t('ebooks.zoomIn') || 'Zoom In'} style={{ color: primaryTextColor }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
                <button onClick={zoomOut} disabled={scale <= 0.5} className="btn btn-sm btn-ghost" title={t('ebooks.zoomOut') || 'Zoom Out'} style={{ color: primaryTextColor }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
            </div>

            {/* PDF Canvas */}
            <div className="overflow-auto w-full h-full" style={{ minHeight: 'calc(100vh - 280px)' }}>
                <div className="flex justify-center items-center min-h-full p-4">
                    <canvas
                        ref={canvasRef}
                        className="shadow-lg border border-base-300"
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
            <div className="bg-base-100 bg-opacity-90 backdrop-blur-sm border-t z-20 p-2 mt-4 rounded-lg shadow-md" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <p className="text-xs text-center opacity-70" style={{ color: secondaryTextColor }}>
                    {t('ebook.securityNotice') || 'This eBook is protected. Downloading, copying, or sharing is not allowed.'}
                </p>
            </div>
        </div>
    );
}

export default SecurePDFViewerPage;
