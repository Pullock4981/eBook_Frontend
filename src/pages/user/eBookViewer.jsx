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
import { useThemeColors } from '../../hooks/useThemeColors';
import { API_BASE_URL } from '../../utils/constants';

function EBookViewer() {
    const { t } = useTranslation();
    const { productId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const accessToken = useSelector(selectAccessToken);
    const currenteBook = useSelector(selectCurrenteBook);
    const isLoading = useSelector(selectEBookLoading);
    const error = useSelector(selectEBookError);
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, infoColor } = useThemeColors();

    const [pdfURL, setPdfURL] = useState(null);

    // Fetch eBook access and set PDF URL
    useEffect(() => {
        if (productId) {
            dispatch(fetcheBookAccess(productId));
        }

        return () => {
            dispatch(clearCurrenteBook());
        };
    }, [dispatch, productId]);

    // Update pdfURL when currenteBook is loaded
    useEffect(() => {
        if (currenteBook && productId) {
            // Check all possible paths for digitalFile in the response
            const digitalFile = currenteBook.data?.product?.digitalFile ||
                currenteBook.product?.digitalFile ||
                currenteBook.digitalFile ||
                currenteBook.data?.directPDFUrl;

            if (digitalFile) {
                // Construct the proxy URL
                // This ensures we use the backend to fetch the file, bypassing 401/CORS
                const proxyURL = `${API_BASE_URL}/products/${productId}/pdf-proxy`;
                console.log('📄 eBookViewer - Using Proxy URL:', proxyURL);
                setPdfURL(proxyURL);
            } else {
                console.error('📄 eBookViewer - Digital file not found in response:', currenteBook);
            }
        }
    }, [currenteBook, productId]);

    useEffect(() => {
        if (error) {
            // Handle error - might be access denied or expired
            console.error('eBook access error:', error);
        }
    }, [error]);

    // NO CONDITIONS - Just show loading if PDF URL is not ready yet
    if (!pdfURL && productId) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1" style={{ color: primaryTextColor }}>
                            {(currenteBook?.data?.product?.name || currenteBook?.product?.name || currenteBook?.name) || t('ebook.reading') || 'Reading eBook'}
                        </h1>
                        <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                            {t('ebook.readerDescription') || 'Secure eBook reader with watermark protection'}
                        </p>
                    </div>
                    <Link
                        to="/dashboard/ebooks"
                        className="btn btn-outline btn-sm sm:btn-md"
                        style={{ borderColor: buttonColor, color: buttonColor }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = buttonColor;
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = buttonColor;
                        }}
                    >
                        {t('ebook.backToEBooks') || 'Back to My eBooks'}
                    </Link>
                </div>

                {/* Security Notice */}
                <div className="alert alert-info mb-4 sm:mb-6" style={{ backgroundColor: infoColor + '20', borderColor: infoColor, color: primaryTextColor }}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: infoColor }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs sm:text-sm" style={{ color: primaryTextColor }}>
                        {t('ebook.securityNotice') || 'This eBook is protected. Downloading, copying, or sharing is not allowed.'}
                    </span>
                </div>

                {/* PDF Viewer - Always show if we have productId */}
                {pdfURL ? (
                    <div className="card bg-base-100 shadow-lg border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="card-body p-2 sm:p-4" style={{ minHeight: '700px' }}>
                            <SecurePDFViewer pdfURL={pdfURL} accessToken={accessToken || 'CART_TOKEN'} />
                        </div>
                    </div>
                ) : productId ? (
                    // If we have productId but no URL yet, show loading
                    <div className="flex justify-center items-center py-12">
                        <Loading />
                    </div>
                ) : (
                    <div className="card bg-base-100 shadow-lg border-2 border-error" style={{ borderColor: '#EF4444', backgroundColor }}>
                        <div className="card-body p-6 text-center">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#EF4444' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-xl font-bold mb-2" style={{ color: '#EF4444' }}>
                                {t('ebook.pdfNotAvailable') || 'PDF Not Available'}
                            </h2>
                            <p className="text-sm opacity-70 mb-4" style={{ color: secondaryTextColor }}>
                                {t('ebook.pdfNotAvailableMessage') || 'Unable to load PDF. Please try again or contact support.'}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary btn-sm"
                                style={{ backgroundColor: buttonColor, color: '#ffffff', border: 'none' }}
                            >
                                {t('common.reload') || 'Reload'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EBookViewer;

