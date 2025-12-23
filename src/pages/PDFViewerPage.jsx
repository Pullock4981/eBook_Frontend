/**
 * PDF Viewer Page
 * 
 * Simple PDF viewer page for logged-in users to read PDFs
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { fetchProductById, selectCurrentProduct, selectIsLoading as selectProductLoading } from '../store/slices/productSlice';
import SecurePDFViewerPage from '../components/ebook/SecurePDFViewerPage';
import Loading from '../components/common/Loading';
import { API_BASE_URL } from '../utils/constants';
import { useThemeColors } from '../hooks/useThemeColors';

function PDFViewerPage() {
    const { t } = useTranslation();
    const { productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const product = useSelector(selectCurrentProduct);
    const isLoadingProduct = useSelector(selectProductLoading);
    const [pdfURL, setPdfURL] = useState(null);
    const [productName, setProductName] = useState('');
    const [error, setError] = useState(null);
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor } = useThemeColors();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (productId) {
            dispatch(fetchProductById({ id: productId, incrementViews: false }));
        }
    }, [isAuthenticated, productId, navigate, dispatch]);

    useEffect(() => {
        if (product && productId) {
            if (product.digitalFile) {
                // Use proxy endpoint to avoid CORS issues
                // Check if it's an external URL (http/https)
                const isExternalURL = product.digitalFile.startsWith('http://') || product.digitalFile.startsWith('https://');

                if (isExternalURL) {
                    // Use backend proxy endpoint to avoid 401 Unauthorized from Cloudinary
                    const proxyURL = `${API_BASE_URL}/products/${productId}/pdf-proxy`;
                    console.log('📄 PDFViewerPage - Using Proxy URL:', proxyURL);
                    setPdfURL(proxyURL);
                } else {
                    // For local/relative files, use direct URL
                    setPdfURL(product.digitalFile);
                }
                setProductName(product.name || 'PDF');
                setError(null);
            } else {
                setError('PDF not found for this product');
            }
        }
    }, [product, productId]);

    const isLoading = isLoadingProduct || !pdfURL;

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
                    <Link
                        to="/products"
                        className="btn btn-primary text-white"
                        style={{ backgroundColor: buttonColor }}
                    >
                        {t('common.back') || 'Back to Products'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pb-4" style={{ backgroundColor }}>
            {/* Header */}
            <div className="bg-base-100 shadow-md border-b" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold truncate" style={{ color: primaryTextColor }}>
                                {productName}
                            </h1>
                            <p className="text-sm opacity-70 mt-1" style={{ color: secondaryTextColor }}>
                                {t('ebooks.reading') || 'Reading PDF'}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-md text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
                            style={{
                                backgroundColor: '#FF6B35',
                                borderColor: '#FF6B35',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#E55A2B';
                                e.currentTarget.style.borderColor = '#E55A2B';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FF6B35';
                                e.currentTarget.style.borderColor = '#FF6B35';
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>{t('common.close') || 'Close'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Secure PDF Viewer */}
            {pdfURL ? (
                <SecurePDFViewerPage productId={productId} pdfURL={pdfURL} />
            ) : (
                <div className="flex items-center justify-center py-20">
                    <Loading />
                </div>
            )}
        </div>
    );
}

export default PDFViewerPage;
