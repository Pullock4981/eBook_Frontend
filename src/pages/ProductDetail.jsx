/**
 * Product Detail Page
 * 
 * Detailed product information page
 */

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, selectCurrentProduct, selectIsLoading, selectError, clearCurrentProduct } from '../store/slices/productSlice';
import ProductGallery from '../components/products/ProductGallery';
import Loading from '../components/common/Loading';
import { formatCurrency, calculateDiscount } from '../utils/helpers';
import { PRODUCT_TYPES } from '../utils/constants';

function ProductDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const product = useSelector(selectCurrentProduct);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById({ id, incrementViews: true }));
        }

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFECE3' }}>
                <Loading />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFECE3' }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('products.notFound') || 'Product Not Found'}
                    </h2>
                    <p className="text-base opacity-70 mb-4" style={{ color: '#2d3748' }}>
                        {error || t('products.notFoundDescription') || 'The product you are looking for does not exist.'}
                    </p>
                    <Link
                        to="/products"
                        className="btn btn-primary text-white"
                        style={{ backgroundColor: '#1E293B' }}
                    >
                        {t('products.backToProducts') || 'Back to Products'}
                    </Link>
                </div>
            </div>
        );
    }

    const discountPercentage = product.discountPrice
        ? calculateDiscount(product.price, product.discountPrice)
        : 0;

    const displayPrice = product.discountPrice || product.price;
    const isPhysical = product.type === PRODUCT_TYPES.PHYSICAL;
    const isDigital = product.type === PRODUCT_TYPES.DIGITAL;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm mb-6">
                    <ul>
                        <li>
                            <Link to="/" style={{ color: '#1E293B' }}>
                                {t('nav.home') || 'Home'}
                            </Link>
                        </li>
                        <li>
                            <Link to="/products" style={{ color: '#1E293B' }}>
                                {t('nav.products') || 'Products'}
                            </Link>
                        </li>
                        {product.category && (
                            <li>
                                <Link
                                    to={`/products?category=${product.category._id}`}
                                    style={{ color: '#1E293B' }}
                                >
                                    {product.category.name}
                                </Link>
                            </li>
                        )}
                        <li style={{ color: '#1E293B' }}>{product.name}</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Images */}
                    <div>
                        <ProductGallery images={product.images || []} productName={product.name} />
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-6">
                        {/* Category */}
                        {product.category && (
                            <div className="badge badge-outline" style={{ borderColor: '#6B8E6B', color: '#6B8E6B' }}>
                                {product.category.name}
                            </div>
                        )}

                        {/* Product Name */}
                        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#1E293B' }}>
                            {product.name}
                        </h1>

                        {/* Price Section */}
                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-bold" style={{ color: '#1E293B' }}>
                                {formatCurrency(displayPrice)}
                            </span>
                            {product.discountPrice && (
                                <>
                                    <span className="text-xl line-through opacity-50" style={{ color: '#2d3748' }}>
                                        {formatCurrency(product.price)}
                                    </span>
                                    <span className="badge badge-error text-white">
                                        -{discountPercentage}% {t('products.off') || 'OFF'}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Type and Stock Info */}
                        <div className="flex flex-wrap gap-2">
                            {isPhysical && (
                                <div className="badge badge-primary text-white">
                                    {t('products.physical') || 'Physical Book'}
                                </div>
                            )}
                            {isDigital && (
                                <div className="badge badge-secondary text-white">
                                    {t('products.digital') || 'Digital eBook'}
                                </div>
                            )}
                            {product.isFeatured && (
                                <div className="badge badge-warning text-white">
                                    {t('products.featured') || 'Featured'}
                                </div>
                            )}
                            {isPhysical && product.stock !== undefined && (
                                <div
                                    className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'} text-white`}
                                >
                                    {product.stock > 0
                                        ? `${t('products.inStock') || 'In Stock'} (${product.stock})`
                                        : t('products.outOfStock') || 'Out of Stock'}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h2 className="text-xl font-semibold mb-2" style={{ color: '#1E293B' }}>
                                    {t('products.description') || 'Description'}
                                </h2>
                                <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: '#2d3748' }}>
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="divider"></div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {product.views > 0 && (
                                <div>
                                    <span className="opacity-70">{t('products.views') || 'Views'}:</span>
                                    <span className="font-semibold ml-2">{product.views}</span>
                                </div>
                            )}
                            {isDigital && product.fileSize && (
                                <div>
                                    <span className="opacity-70">{t('products.fileSize') || 'File Size'}:</span>
                                    <span className="font-semibold ml-2">
                                        {(product.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2" style={{ color: '#1E293B' }}>
                                    {t('products.tags') || 'Tags'}:
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-outline"
                                            style={{ borderColor: '#6B8E6B', color: '#6B8E6B' }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                className="btn btn-primary btn-lg flex-grow text-white"
                                style={{ backgroundColor: '#1E293B' }}
                                disabled={isPhysical && product.stock === 0}
                            >
                                {t('products.addToCart') || 'Add to Cart'}
                            </button>
                            <button
                                className="btn btn-outline btn-lg"
                                style={{ borderColor: '#1E293B', color: '#1E293B' }}
                            >
                                {t('products.wishlist') || 'Wishlist'}
                            </button>
                        </div>

                        {/* Note: Add to Cart will be implemented in Part 6 */}
                        {isPhysical && product.stock === 0 && (
                            <div className="alert alert-warning">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                <span>{t('products.outOfStockMessage') || 'This product is currently out of stock.'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

