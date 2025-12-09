/**
 * Cart Page
 * 
 * Shopping cart page with cart items and summary
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, selectCartItems, selectCartLoading, selectCartError, selectCartItemCount } from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Loading from '../components/common/Loading';
import { useThemeColors } from '../hooks/useThemeColors';

function Cart() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const items = useSelector(selectCartItems);
    const isLoading = useSelector(selectCartLoading);
    const error = useSelector(selectCartError);
    const itemCount = useSelector(selectCartItemCount);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    // Redirect to products page if cart becomes empty
    useEffect(() => {
        if (isAuthenticated && !isLoading && items.length === 0 && itemCount === 0) {
            // Small delay to show empty state message briefly
            const timer = setTimeout(() => {
                navigate('/products');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, isLoading, items.length, itemCount, navigate]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('cart.loginRequired') || 'Login Required'}
                    </h2>
                    <p className="text-base opacity-70 mb-4" style={{ color: secondaryTextColor }}>
                        {t('cart.loginRequiredMessage') || 'Please login to view your cart'}
                    </p>
                    <Link
                        to="/login"
                        className="btn btn-primary text-white"
                        style={{ backgroundColor: buttonColor }}
                    >
                        {t('nav.login') || 'Login'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('nav.cart') || 'Shopping Cart'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {itemCount > 0
                            ? t('cart.itemsInCart', { count: itemCount }) || `${itemCount} item(s) in your cart`
                            : t('cart.emptyCartMessage') || 'Your cart is empty'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-6">
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && items.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <Loading />
                    </div>
                ) : items.length === 0 ? (
                    /* Empty Cart */
                    <div className="card bg-base-100 shadow-sm">
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
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                    />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: primaryTextColor }}>
                                    {t('cart.emptyCart') || 'Your Cart is Empty'}
                                </h3>
                                <p className="text-sm sm:text-base opacity-70 mb-4 sm:mb-6 px-4" style={{ color: secondaryTextColor }}>
                                    {t('cart.emptyCartDescription') || 'Add some products to your cart to get started!'}
                                </p>
                                <Link
                                    to="/products"
                                    className="btn btn-primary text-white inline-flex items-center gap-2 btn-sm sm:btn-md"
                                    style={{ backgroundColor: buttonColor }}
                                >
                                    <svg
                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                        />
                                    </svg>
                                    {t('cart.startShopping') || 'Start Shopping'}
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Cart Items & Summary */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                            {items.map((item) => (
                                <CartItem key={item.product?._id || item.product || item._id} item={item} />
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="lg:col-span-1">
                            <CartSummary />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;

