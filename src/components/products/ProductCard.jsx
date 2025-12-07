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
    // Use a data URI for placeholder to avoid network errors
    const productImage = product.images && product.images.length > 0
        ? product.images[0]
        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

    // Get product URL (use slug if available, otherwise ID)
    // Ensure we have a valid ID and convert to string
    const productId = product._id || product.id;
    if (!productId) {
        console.error('Product missing ID:', product);
        return null;
    }
    // Convert to string
    const productIdString = String(productId).trim();
    // Use slug if available, otherwise use ID
    // Slug is preferred for SEO-friendly URLs
    const productUrl = product.slug ? `/products/${product.slug}` : `/products/${productIdString}`;

    return (
        <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col border border-base-200">
            {/* Product Image */}
            <Link to={productUrl} className="relative overflow-hidden group">
                <figure className="relative w-full aspect-[3/2] bg-base-200">
                    <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                    />
                    {/* Discount Badge - Minimal */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-2 right-2 badge badge-error badge-sm text-white">
                            -{discountPercentage}%
                        </div>
                    )}
                </figure>
            </Link>

            {/* Card Body - Minimal */}
            <div className="card-body flex-grow flex flex-col p-4 sm:p-5">
                {/* Product Name */}
                <Link to={productUrl} className="flex-grow">
                    <h2 className="text-base sm:text-lg font-semibold line-clamp-2 hover:text-primary transition-colors mb-2" style={{ color: '#1E293B' }}>
                        {product.name}
                    </h2>
                </Link>

                {/* Price Section */}
                <div className="mt-auto pt-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg sm:text-xl font-bold" style={{ color: '#1E293B' }}>
                            {formatCurrency(displayPrice)}
                        </span>
                        {product.discountPrice && (
                            <span className="text-sm line-through opacity-50" style={{ color: '#2d3748' }}>
                                {formatCurrency(product.price)}
                            </span>
                        )}
                    </div>

                    {/* Type and Stock - Minimal */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className={`badge badge-sm ${isPhysical ? 'badge-primary' : 'badge-secondary'}`}>
                            {isPhysical ? t('products.physical') : t('products.digital')}
                        </span>
                        {isPhysical && product.stock !== undefined && (
                            <span className={`text-xs ${product.stock > 0 ? 'text-success' : 'text-error'}`}>
                                {product.stock > 0 ? `${t('products.inStock') || 'In Stock'}` : t('products.outOfStock') || 'Out of Stock'}
                            </span>
                        )}
                    </div>

                    {/* Action Button */}
                    <Link
                        to={productUrl}
                        className="btn btn-sm btn-primary w-full text-white px-4 py-2"
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

