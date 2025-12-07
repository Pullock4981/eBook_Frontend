/**
 * eBooks Page
 * 
 * User's purchased eBooks listing page
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserEBooks, selectEBooks, selectEBookLoading, selectEBookError, clearError } from '../../store/slices/ebookSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import eBookCard from '../../components/ebook/eBookCard';
import Loading from '../../components/common/Loading';

function eBooks() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const eBooks = useSelector(selectEBooks);
    const isLoading = useSelector(selectEBookLoading);
    const error = useSelector(selectEBookError);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchUserEBooks());
    }, [dispatch, isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            // Silently handle error - might be no eBooks yet
            dispatch(clearError());
        }
    }, [error, dispatch]);

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('ebook.myEBooks') || 'My eBooks'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                        {t('ebook.myEBooksDescription') || 'Access and read your purchased eBooks'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-6">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm sm:text-base">{error}</span>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && eBooks.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <Loading />
                    </div>
                ) : eBooks.length === 0 ? (
                    /* Empty State */
                    <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: '#f1f5f9' }}>
                                <svg
                                    className="w-10 h-10 sm:w-12 sm:h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: '#94a3b8' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: '#1E293B' }}>
                                {t('ebook.noEBooks') || 'No eBooks Yet'}
                            </h3>
                            <p className="text-sm sm:text-base text-center opacity-70 mb-6 max-w-md" style={{ color: '#2d3748' }}>
                                {t('ebook.noEBooksDescription') || "You haven't purchased any eBooks yet. Browse our collection and start reading!"}
                            </p>
                            <Link
                                to="/products"
                                className="btn btn-primary text-white"
                                style={{ backgroundColor: '#1E293B' }}
                            >
                                {t('ebook.browseBooks') || 'Browse Books'}
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* eBooks Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {eBooks.map((eBook) => (
                            <eBookCard key={eBook.id || eBook.product?.id || eBook.product?._id} eBook={eBook} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default eBooks;

