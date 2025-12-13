/**
 * Cart Item Component
 * 
 * Displays a single cart item with quantity controls and remove button
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { updateItemQuantity, removeItemFromCart } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils/helpers';
import { PRODUCT_TYPES } from '../../utils/constants';
import { useThemeColors } from '../../hooks/useThemeColors';

function CartItem({ item }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const {
        cardBackgroundColor,
        primaryTextColor,
        secondaryTextColor,
        borderColor,
        buttonColor,
        buttonTextColor,
    } = useThemeColors();

    const product = item.product || {};
    // Ensure productId is a string
    const productIdRaw = product._id || product.id || item.product;
    const productId = productIdRaw?.toString ? productIdRaw.toString() : String(productIdRaw || '');
    const productName = product.name || item.productSnapshot?.name || 'Product';
    const productImage = product.images?.[0] || item.productSnapshot?.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    const isPhysical = product.type === PRODUCT_TYPES.PHYSICAL || item.productSnapshot?.type === PRODUCT_TYPES.PHYSICAL;
    const itemTotal = item.price * item.quantity;

    const handleQuantityChange = async (newQuantity) => {
        // If quantity becomes 0 or less, remove item automatically
        if (newQuantity < 1) {
            handleRemove();
            return;
        }

        // Don't update if quantity is same
        if (newQuantity === item.quantity) return;

        setIsUpdating(true);
        try {
            // Update quantity (backend will automatically remove if quantity becomes 0)
            await dispatch(updateItemQuantity({ productId, quantity: newQuantity })).unwrap();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            // Show error toast/alert if needed
        } finally {
            setIsUpdating(false);
        }
    };

    const handleIncrease = () => {
        handleQuantityChange(item.quantity + 1);
    };

    const handleDecrease = () => {
        const newQuantity = item.quantity - 1;
        if (newQuantity < 1) {
            // Automatically remove when quantity becomes 0
            handleRemove();
        } else {
            handleQuantityChange(newQuantity);
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            await dispatch(removeItemFromCart(productId)).unwrap();
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setIsRemoving(false);
        }
    };

    const productUrl = product.slug ? `/products/${product.slug}` : `/products/${productId}`;

    return (
        <div className="card shadow-sm border" style={{ borderColor, backgroundColor: cardBackgroundColor }}>
            <div className="card-body p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    {/* Product Image */}
                    <Link to={productUrl} className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg overflow-hidden" style={{ backgroundColor: borderColor }}>
                            <img
                                src={productImage}
                                alt={productName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                }}
                            />
                        </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-grow min-w-0 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-grow min-w-0">
                                <Link to={productUrl} className="hover:text-primary transition-colors">
                                    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 line-clamp-2" style={{ color: primaryTextColor }}>
                                        {productName}
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <span className={`badge badge-sm ${isPhysical ? 'badge-primary' : 'badge-secondary'}`}>
                                        {isPhysical ? t('products.physical') : t('products.digital')}
                                    </span>
                                </div>
                                <div className="text-base sm:text-lg font-bold mb-2 sm:mb-0" style={{ color: primaryTextColor }}>
                                    {formatCurrency(item.price)}
                                </div>
                            </div>

                            {/* Quantity Controls & Remove */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn btn-sm btn-outline px-3 sm:px-4"
                                        onClick={handleDecrease}
                                        disabled={isUpdating || isRemoving}
                                        style={{ borderColor: buttonColor, color: buttonColor }}
                                        aria-label={t('cart.decreaseQuantity') || 'Decrease quantity'}
                                    >
                                        {isUpdating ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className="text-base font-semibold min-w-[40px] text-center px-2" style={{ color: primaryTextColor }}>
                                        {item.quantity}
                                    </span>
                                    <button
                                        className="btn btn-sm btn-outline px-3 sm:px-4"
                                        onClick={handleIncrease}
                                        disabled={isUpdating || isRemoving}
                                        style={{ borderColor: buttonColor, color: buttonColor }}
                                        aria-label={t('cart.increaseQuantity') || 'Increase quantity'}
                                    >
                                        {isUpdating ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Item Total */}
                                <div className="text-right sm:text-left">
                                    <div className="text-base sm:text-lg md:text-xl font-bold" style={{ color: primaryTextColor }}>
                                        {formatCurrency(itemTotal)}
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    className="btn btn-sm btn-ghost text-error hover:bg-error hover:text-white px-3 sm:px-4"
                                    onClick={handleRemove}
                                    disabled={isRemoving || isUpdating}
                                    aria-label={t('common.remove') || 'Remove'}
                                >
                                    {isRemoving ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                    ) : (
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartItem;

