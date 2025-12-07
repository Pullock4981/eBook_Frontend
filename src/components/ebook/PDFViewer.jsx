/**
 * PDF Viewer Component
 * 
 * Secure PDF viewer with download prevention
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

function PDFViewer({ pdfURL, accessToken }) {
    const { t } = useTranslation();
    const iframeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable text selection
        const handleSelectStart = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable keyboard shortcuts (Ctrl+S, Ctrl+P, etc.)
        const handleKeyDown = (e) => {
            // Disable Ctrl+S (Save)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+P (Print)
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                return false;
            }
            // Disable F12 (Developer Tools)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleLoad = () => {
        setIsLoading(false);
        setError(null);
    };

    const handleError = () => {
        setIsLoading(false);
        setError(t('ebook.failedToLoadPDF') || 'Failed to load PDF');
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px] bg-base-200 rounded-lg">
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
        <div className="relative w-full h-full min-h-[600px] bg-base-200 rounded-lg overflow-hidden" style={{ userSelect: 'none' }}>
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
            <iframe
                ref={iframeRef}
                src={pdfURL}
                className="w-full h-full border-0"
                title="PDF Viewer"
                onLoad={handleLoad}
                onError={handleError}
                style={{
                    minHeight: '600px',
                    height: '100%',
                }}
            />
        </div>
    );
}

export default PDFViewer;

