/**
 * Public eBooks List Page
 * 
 * Shows all available eBooks/PDFs sorted and filterable
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, selectProducts, selectIsLoading, selectPagination } from '../../store/slices/productSlice';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { checkeBookAccess } from '../../services/ebookService';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { PRODUCT_TYPES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { useThemeColors } from '../../hooks/useThemeColors';

function eBooksList() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const products = useSelector(selectProducts);
    const isLoading = useSelector(selectIsLoading);
    const pagination = useSelector(selectPagination);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const [sortBy, setSortBy] = useState('name'); // name, price, priceDesc
    const [filterFeatured, setFilterFeatured] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [purchasedProducts, setPurchasedProducts] = useState(new Set());
    const [checkingAccess, setCheckingAccess] = useState(false);

    useEffect(() => {
        // Fetch only digital products with pagination
        dispatch(fetchProducts({
            type: PRODUCT_TYPES.DIGITAL,
            page: currentPage,
            limit: itemsPerPage
        }));
    }, [dispatch, currentPage, itemsPerPage]);

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

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('ebooks.title') || 'Read PDF eBooks'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {t('ebooks.description') || 'Browse and purchase digital eBooks'}
                    </p>
                </div>

                {/* Filters and Sort */}
                <div className="bg-base-100 rounded-lg shadow-sm border mb-6" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
                            {/* Featured Filter */}
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={filterFeatured}
                                        onChange={(e) => setFilterFeatured(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${filterFeatured
                                            ? 'border-[#1E293B]'
                                            : 'border-gray-300 group-hover:border-[#1E293B]'
                                            }`}
                                        style={{
                                            backgroundColor: filterFeatured ? buttonColor : backgroundColor,
                                            borderColor: filterFeatured ? buttonColor : secondaryTextColor
                                        }}
                                    >
                                        {filterFeatured && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="ml-3 text-sm font-medium" style={{ color: primaryTextColor }}>
                                    {t('ebooks.showFeaturedOnly') || 'Show Featured Only'}
                                </span>
                            </label>

                            {/* Sort Options */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-sm font-medium whitespace-nowrap" style={{ color: secondaryTextColor }}>
                                    {t('ebooks.sortBy') || 'Sort By:'}
                                </span>
                                <div className="relative flex-1 sm:flex-none">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full sm:w-auto appearance-none border-2 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                        style={{
                                            borderColor: secondaryTextColor,
                                            color: primaryTextColor,
                                            backgroundColor,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="name">{t('ebooks.sortByName') || 'Name (A-Z)'}</option>
                                        <option value="price">{t('ebooks.sortByPriceLow') || 'Price (Low to High)'}</option>
                                        <option value="priceDesc">{t('ebooks.sortByPriceHigh') || 'Price (High to Low)'}</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: secondaryTextColor }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
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
                    <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                <svg
                                    className="w-10 h-10 sm:w-12 sm:h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: secondaryTextColor }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: primaryTextColor }}>
                                {t('ebooks.noEBooksFound') || 'No eBooks Found'}
                            </h3>
                            <p className="text-sm sm:text-base text-center opacity-70 mb-6 max-w-md" style={{ color: secondaryTextColor }}>
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
                                        borderColor: secondaryTextColor,
                                        backgroundColor
                                    }}
                                >
                                    {/* Clickable Image/Title - goes to product detail if not purchased */}
                                    {!isPurchased ? (
                                        <Link
                                            to={`/products/${product.slug || productId}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <figure className="aspect-[3/2] overflow-hidden bg-base-200 relative cursor-pointer">
                                                <img
                                                    src={thumbnail}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5lQm9vazwvdGV4dD48L3N2Zz4=';
                                                    }}
                                                />
                                                {product.isFeatured && (
                                                    <div className="absolute top-2 right-2 badge badge-primary text-white text-xs" style={{ backgroundColor: buttonColor }}>
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
                                        <figure className="aspect-[3/2] overflow-hidden bg-base-200 relative">
                                            <img
                                                src={thumbnail}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5lQm9vazwvdGV4dD48L3N2Zz4=';
                                                }}
                                            />
                                            {product.isFeatured && (
                                                <div className="absolute top-2 right-2 badge badge-primary text-white text-xs" style={{ backgroundColor: buttonColor }}>
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
                                                <h3 className="card-title text-base sm:text-lg font-bold line-clamp-2 hover:underline" style={{ color: primaryTextColor }}>
                                                    {product.name}
                                                </h3>
                                            </Link>
                                        ) : (
                                            <h3 className="card-title text-base sm:text-lg font-bold line-clamp-2" style={{ color: primaryTextColor }}>
                                                {product.name}
                                            </h3>
                                        )}
                                        {product.shortDescription && (
                                            <p className="text-xs sm:text-sm opacity-70 line-clamp-2 mb-2" style={{ color: secondaryTextColor }}>
                                                {product.shortDescription}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                {hasDiscount ? (
                                                    <>
                                                        <span className="text-lg font-bold" style={{ color: primaryTextColor }}>
                                                            {formatCurrency(finalPrice)}
                                                        </span>
                                                        <span className="text-xs line-through opacity-50" style={{ color: secondaryTextColor }}>
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-bold" style={{ color: primaryTextColor }}>
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
                                                    className="btn btn-primary btn-sm text-white px-4 py-2"
                                                    style={{ backgroundColor: buttonColor }}
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

                {/* Pagination */}
                {filteredProducts.length > 0 && pagination && pagination.totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={pagination.currentPage || currentPage}
                            totalPages={pagination.totalPages || 1}
                            totalItems={pagination.totalItems || filteredProducts.length}
                            itemsPerPage={pagination.itemsPerPage || itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default eBooksList;

