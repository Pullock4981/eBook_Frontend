/**
 * Product Card Component
 * 
 * Displays a single product in card format
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency, calculateDiscount } from '../../utils/helpers';
import { PRODUCT_TYPES } from '../../utils/constants';

function ProductCard({ product }) {
    const { t } = useTranslation();

    if (!product) return null;

    const discountPercentage = product.discountPrice
        ? calculateDiscount(product.price, product.discountPrice)
        : 0;

    const displayPrice = product.discountPrice || product.price;
    const isPhysical = product.type === PRODUCT_TYPES.PHYSICAL;
    const isDigital = product.type === PRODUCT_TYPES.DIGITAL;

    // Get product image (first image or placeholder)
    const productImage = product.images && product.images.length > 0
        ? product.images[0]
        : 'https://via.placeholder.com/300x400?text=No+Image';

    // Get product URL (use slug if available, otherwise ID)
    const productUrl = product.slug ? `/products/${product.slug}` : `/products/${product._id}`;

    return (
        <div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
            {/* Product Image */}
            <Link to={productUrl} className="relative overflow-hidden group">
                <figure className="relative w-full h-64 bg-base-200">
                    <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-2 right-2 badge badge-error text-white font-bold">
                            -{discountPercentage}%
                        </div>
                    )}
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                        {isPhysical && (
                            <div className="badge badge-primary text-white">
                                {t('products.physical') || 'Physical'}
                            </div>
                        )}
                        {isDigital && (
                            <div className="badge badge-secondary text-white">
                                {t('products.digital') || 'Digital'}
                            </div>
                        )}
                    </div>
                    {/* Featured Badge */}
                    {product.isFeatured && (
                        <div className="absolute bottom-2 left-2 badge badge-warning text-white">
                            {t('products.featured') || 'Featured'}
                        </div>
                    )}
                </figure>
            </Link>

            {/* Card Body */}
            <div className="card-body flex-grow flex flex-col p-4">
                {/* Category */}
                {product.category?.name && (
                    <div className="text-xs opacity-70 mb-1" style={{ color: '#6B8E6B' }}>
                        {product.category.name}
                    </div>
                )}

                {/* Product Name */}
                <Link to={productUrl}>
                    <h2 className="card-title text-base font-semibold line-clamp-2 hover:text-primary transition-colors" style={{ color: '#1E293B' }}>
                        {product.name}
                    </h2>
                </Link>

                {/* Description */}
                {product.description && (
                    <p className="text-sm opacity-70 line-clamp-2 mt-1" style={{ color: '#2d3748' }}>
                        {product.description}
                    </p>
                )}

                {/* Price Section */}
                <div className="mt-auto pt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold" style={{ color: '#1E293B' }}>
                            {formatCurrency(displayPrice)}
                        </span>
                        {product.discountPrice && (
                            <span className="text-sm line-through opacity-50" style={{ color: '#2d3748' }}>
                                {formatCurrency(product.price)}
                            </span>
                        )}
                    </div>

                    {/* Stock Info (Physical products only) */}
                    {isPhysical && product.stock !== undefined && (
                        <div className="text-xs mt-1" style={{ color: product.stock > 0 ? '#6B8E6B' : '#EF4444' }}>
                            {product.stock > 0
                                ? `${t('products.inStock') || 'In Stock'} (${product.stock})`
                                : t('products.outOfStock') || 'Out of Stock'}
                        </div>
                    )}

                    {/* Views Count */}
                    {product.views > 0 && (
                        <div className="text-xs opacity-50 mt-1" style={{ color: '#2d3748' }}>
                            {product.views} {t('products.views') || 'views'}
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="card-actions justify-end mt-3">
                    <Link
                        to={productUrl}
                        className="btn btn-sm btn-primary w-full text-white"
                        style={{ backgroundColor: '#1E293B' }}
                    >
                        {t('products.viewDetails') || 'View Details'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;

