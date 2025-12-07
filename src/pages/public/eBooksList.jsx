/**
 * Public eBooks List Page
 * 
 * Shows all available eBooks/PDFs sorted and filterable
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, selectProducts, selectIsLoading } from '../../store/slices/productSlice';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { checkeBookAccess } from '../../services/ebookService';
import Loading from '../../components/common/Loading';
import { PRODUCT_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

function eBooksList() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const products = useSelector(selectProducts);
    const isLoading = useSelector(selectIsLoading);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const [sortBy, setSortBy] = useState('name'); // name, price, priceDesc
    const [filterFeatured, setFilterFeatured] = useState(false);
    const [purchasedProducts, setPurchasedProducts] = useState(new Set());
    const [checkingAccess, setCheckingAccess] = useState(false);

    useEffect(() => {
        // Fetch only digital products
        dispatch(fetchProducts({
            type: PRODUCT_TYPES.DIGITAL,
            limit: 100
        }));
    }, [dispatch]);

    // Check purchased status for authenticated users
    useEffect(() => {
        const checkPurchasedStatus = async () => {
            if (!isAuthenticated || products.length === 0) {
                return;
            }

            setCheckingAccess(true);
            const purchasedSet = new Set();

            for (const product of products) {
                const productId = product.id || product._id;
                if (productId) {
                    try {
                        const hasAccess = await checkeBookAccess(productId);
                        if (hasAccess) {
                            purchasedSet.add(productId);
                        }
                    } catch (error) {
                        // Silently fail - product might not be purchased
                    }
                }
            }

            setPurchasedProducts(purchasedSet);
            setCheckingAccess(false);
        };

        checkPurchasedStatus();
    }, [isAuthenticated, products]);

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            if (filterFeatured && !product.isFeatured) return false;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return (a.discountPrice || a.price) - (b.discountPrice || b.price);
                case 'priceDesc':
                    return (b.discountPrice || b.price) - (a.discountPrice || a.price);
                default:
                    return 0;
            }
        });

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('ebooks.title') || 'Read PDF eBooks'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                        {t('ebooks.description') || 'Browse and purchase digital eBooks'}
                    </p>
                </div>

                {/* Filters and Sort */}
                <div className="card bg-base-100 shadow-sm border-2 mb-6" style={{ borderColor: '#e2e8f0' }}>
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            {/* Featured Filter */}
                            <label className="label cursor-pointer gap-3">
                                <input
                                    type="checkbox"
                                    checked={filterFeatured}
                                    onChange={(e) => setFilterFeatured(e.target.checked)}
                                    className="checkbox checkbox-primary"
                                    style={{ accentColor: '#1E293B' }}
                                />
                                <span className="label-text text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                    {t('ebooks.showFeaturedOnly') || 'Show Featured Only'}
                                </span>
                            </label>

                            {/* Sort Options */}
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold" style={{ color: '#1E293B' }}>
                                    {t('ebooks.sortBy') || 'Sort By:'}
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="select select-bordered select-sm sm:select-md"
                                    style={{ borderColor: '#cbd5e1', color: '#1E293B' }}
                                >
                                    <option value="name">{t('ebooks.sortByName') || 'Name (A-Z)'}</option>
                                    <option value="price">{t('ebooks.sortByPriceLow') || 'Price (Low to High)'}</option>
                                    <option value="priceDesc">{t('ebooks.sortByPriceHigh') || 'Price (High to Low)'}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loading />
                    </div>
                ) : filteredProducts.length === 0 ? (
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
                                {t('ebooks.noEBooksFound') || 'No eBooks Found'}
                            </h3>
                            <p className="text-sm sm:text-base text-center opacity-70 mb-6 max-w-md" style={{ color: '#2d3748' }}>
                                {t('ebooks.noEBooksMessage') || 'No eBooks are available at the moment. Please check back later.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* eBooks Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {filteredProducts.map((product) => {
                            const thumbnail = product.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5lQm9vazwvdGV4dD48L3N2Zz4=';
                            const finalPrice = product.discountPrice || product.price;
                            const hasDiscount = product.discountPrice && product.discountPrice < product.price;

                            const isPurchased = isAuthenticated && purchasedProducts.has(product.id || product._id);
                            const productId = product.id || product._id;

                            return (
                                <div
                                    key={productId}
                                    className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-primary"
                                    style={{
                                        borderColor: '#e2e8f0',
                                    }}
                                >
                                    {/* Clickable Image/Title - goes to product detail if not purchased */}
                                    {!isPurchased ? (
                                        <Link
                                            to={`/products/${product.slug || productId}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <figure className="aspect-[3/4] overflow-hidden bg-base-200 relative cursor-pointer">
                                                <img
                                                    src={thumbnail}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5lQm9vazwvdGV4dD48L3N2Zz4=';
                                                    }}
                                                />
                                                {product.isFeatured && (
                                                    <div className="absolute top-2 right-2 badge badge-primary text-white text-xs" style={{ backgroundColor: '#1E293B' }}>
                                                        {t('products.featured') || 'Featured'}
                                                    </div>
                                                )}
                                                {hasDiscount && (
                                                    <div className="absolute top-2 left-2 badge badge-error text-white text-xs">
                                                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                                                    </div>
                                                )}
                                            </figure>
                                        </Link>
                                    ) : (
                                        <figure className="aspect-[3/4] overflow-hidden bg-base-200 relative">
                                            <img
                                                src={thumbnail}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5lQm9vazwvdGV4dD48L3N2Zz4=';
                                                }}
                                            />
                                            {product.isFeatured && (
                                                <div className="absolute top-2 right-2 badge badge-primary text-white text-xs" style={{ backgroundColor: '#1E293B' }}>
                                                    {t('products.featured') || 'Featured'}
                                                </div>
                                            )}
                                            {hasDiscount && (
                                                <div className="absolute top-2 left-2 badge badge-error text-white text-xs">
                                                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                                                </div>
                                            )}
                                            {/* Purchased Badge */}
                                            <div className="absolute bottom-2 left-2 badge badge-success text-white text-xs">
                                                {t('ebooks.alreadyPurchased') || 'Purchased'}
                                            </div>
                                        </figure>
                                    )}
                                    <div className="card-body p-4">
                                        {!isPurchased ? (
                                            <Link
                                                to={`/products/${product.slug || productId}`}
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <h3 className="card-title text-base sm:text-lg font-bold line-clamp-2 hover:underline" style={{ color: '#1E293B' }}>
                                                    {product.name}
                                                </h3>
                                            </Link>
                                        ) : (
                                            <h3 className="card-title text-base sm:text-lg font-bold line-clamp-2" style={{ color: '#1E293B' }}>
                                                {product.name}
                                            </h3>
                                        )}
                                        {product.shortDescription && (
                                            <p className="text-xs sm:text-sm opacity-70 line-clamp-2 mb-2" style={{ color: '#2d3748' }}>
                                                {product.shortDescription}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                {hasDiscount ? (
                                                    <>
                                                        <span className="text-lg font-bold" style={{ color: '#1E293B' }}>
                                                            {formatCurrency(finalPrice)}
                                                        </span>
                                                        <span className="text-xs line-through opacity-50" style={{ color: '#2d3748' }}>
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-bold" style={{ color: '#1E293B' }}>
                                                        {formatCurrency(finalPrice)}
                                                    </span>
                                                )}
                                            </div>
                                            {isPurchased ? (
                                                <button
                                                    onClick={() => {
                                                        navigate(`/ebooks/viewer/${productId}`);
                                                    }}
                                                    className="btn btn-success btn-sm text-white shadow-md hover:shadow-lg transition-all"
                                                    style={{
                                                        backgroundColor: '#10b981',
                                                        fontWeight: '600',
                                                        minWidth: '100px'
                                                    }}
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    {t('ebooks.readNow') || 'Read Now'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        navigate(`/products/${product.slug || productId}`);
                                                    }}
                                                    className="btn btn-primary btn-sm text-white"
                                                    style={{ backgroundColor: '#1E293B' }}
                                                >
                                                    {t('products.viewDetails') || 'View Details'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Results Count */}
                {filteredProducts.length > 0 && (
                    <div className="mt-6 text-center">
                        <p className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                            {t('ebooks.showingResults', { count: filteredProducts.length, total: products.length }) ||
                                `Showing ${filteredProducts.length} of ${products.length} eBooks`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default eBooksList;

