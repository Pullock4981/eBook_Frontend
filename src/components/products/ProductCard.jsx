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
        <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col border border-base-200">
            {/* Product Image */}
            <Link to={productUrl} className="relative overflow-hidden group">
                <figure className="relative w-full h-48 sm:h-56 bg-base-200">
                    <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
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

