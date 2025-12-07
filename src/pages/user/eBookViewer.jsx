/**
 * eBook Viewer Page
 * 
 * Secure PDF viewer page for reading eBooks
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetcheBookAccess, selectAccessToken, selectCurrenteBook, selectEBookLoading, selectEBookError, clearError, clearCurrenteBook } from '../../store/slices/ebookSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import PDFViewer from '../../components/ebook/PDFViewer';
import SecurePDFViewer from '../../components/ebook/SecurePDFViewer';
import Loading from '../../components/common/Loading';
import { getPDFURL } from '../../services/ebookService';

function eBookViewer() {
    const { t } = useTranslation();
    const { productId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const accessToken = useSelector(selectAccessToken);
    const currenteBook = useSelector(selectCurrenteBook);
    const isLoading = useSelector(selectEBookLoading);
    const error = useSelector(selectEBookError);

    const [pdfURL, setPdfURL] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (productId) {
            dispatch(fetcheBookAccess(productId));
        }

        return () => {
            dispatch(clearCurrenteBook());
        };
    }, [dispatch, isAuthenticated, navigate, productId]);

    useEffect(() => {
        if (accessToken) {
            const url = getPDFURL(accessToken);
            setPdfURL(url);
        }
    }, [accessToken]);

    useEffect(() => {
        if (error) {
            // Handle error - might be access denied or expired
            console.error('eBook access error:', error);
        }
    }, [error]);

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    if (isLoading && !accessToken) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFECE3' }}>
                <Loading />
            </div>
        );
    }

    if (error && !accessToken) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
                <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                    <div className="card bg-base-100 shadow-lg border-2 border-error" style={{ borderColor: '#EF4444' }}>
                        <div className="card-body p-6 sm:p-8 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-error">
                                {t('ebook.accessDenied') || 'Access Denied'}
                            </h2>
                            <p className="text-sm sm:text-base opacity-70 mb-6" style={{ color: '#2d3748' }}>
                                {error || t('ebook.accessDeniedMessage') || 'You do not have access to this eBook. Please ensure you have purchased it.'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/dashboard/ebooks"
                                    className="btn btn-outline"
                                    style={{ borderColor: '#1E293B', color: '#1E293B' }}
                                >
                                    {t('ebook.backToEBooks') || 'Back to My eBooks'}
                                </Link>
                                <Link
                                    to="/products"
                                    className="btn btn-primary text-white"
                                    style={{ backgroundColor: '#1E293B' }}
                                >
                                    {t('ebook.browseBooks') || 'Browse Books'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1" style={{ color: '#1E293B' }}>
                            {currenteBook?.title || t('ebook.reading') || 'Reading eBook'}
                        </h1>
                        <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                            {t('ebook.readerDescription') || 'Secure eBook reader with watermark protection'}
                        </p>
                    </div>
                    <Link
                        to="/dashboard/ebooks"
                        className="btn btn-outline btn-sm sm:btn-md"
                        style={{ borderColor: '#1E293B', color: '#1E293B' }}
                    >
                        {t('ebook.backToEBooks') || 'Back to My eBooks'}
                    </Link>
                </div>

                {/* Security Notice */}
                <div className="alert alert-info mb-4 sm:mb-6">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm">
                        {t('ebook.securityNotice') || 'This eBook is protected. Downloading, copying, or sharing is not allowed.'}
                    </span>
                </div>

                {/* PDF Viewer */}
                {pdfURL && accessToken ? (
                    <div className="card bg-base-100 shadow-lg border-2" style={{ borderColor: '#e2e8f0' }}>
                        <div className="card-body p-2 sm:p-4" style={{ minHeight: '700px' }}>
                            <SecurePDFViewer pdfURL={pdfURL} accessToken={accessToken} />
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center py-12">
                        <Loading />
                    </div>
                )}
            </div>
        </div>
    );
}

export default eBookViewer;

