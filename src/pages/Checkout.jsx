/**
 * Checkout Page
 * 
 * Checkout page for placing orders
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, selectCartItems, selectCartLoading, selectCartError, selectCart } from '../store/slices/cartSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { createOrder, clearCurrentOrder } from '../store/slices/orderSlice';
import { clearCartItems } from '../store/slices/cartSlice';
import AddressSelector from '../components/orders/AddressSelector';
import PaymentMethodSelector from '../components/orders/PaymentMethodSelector';
import OrderSummary from '../components/orders/OrderSummary';
import CartItem from '../components/cart/CartItem';
import Loading from '../components/common/Loading';
import { PRODUCT_TYPES } from '../utils/constants';
import { useThemeColors } from '../hooks/useThemeColors';

function Checkout() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        backgroundColor,
        cardBackgroundColor,
        primaryTextColor,
        secondaryTextColor,
        buttonColor,
        buttonTextColor,
        borderColor,
    } = useThemeColors();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const items = useSelector(selectCartItems);
    const { subtotal, discount, total } = useSelector(selectCart);
    const isLoading = useSelector(selectCartLoading);
    const error = useSelector(selectCartError);
    const orderLoading = useSelector((state) => state.orders.isLoading);
    const orderError = useSelector((state) => state.orders.error);

    const [shippingAddress, setShippingAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('sslcommerz');
    const [notes, setNotes] = useState('');
    const [hasPhysicalProducts, setHasPhysicalProducts] = useState(false);
    const [shipping, setShipping] = useState(0);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    // Check if cart has physical products
    useEffect(() => {
        const hasPhysical = items.some(item => {
            const product = item.product || {};
            return product.type === PRODUCT_TYPES.PHYSICAL;
        });
        setHasPhysicalProducts(hasPhysical);

        // Calculate shipping (50 BDT per physical item)
        if (hasPhysical) {
            const physicalItems = items.filter(item => {
                const product = item.product || {};
                return product.type === PRODUCT_TYPES.PHYSICAL;
            });
            setShipping(physicalItems.length * 50);
        } else {
            setShipping(0);
        }
    }, [items]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Redirect if cart is empty
    useEffect(() => {
        if (isAuthenticated && !isLoading && items.length === 0) {
            navigate('/cart');
        }
    }, [isAuthenticated, isLoading, items.length, navigate]);

    const handlePlaceOrder = async () => {
        // Validation
        if (hasPhysicalProducts && !shippingAddress) {
            alert(t('checkout.addressRequired') || 'Please select a shipping address');
            return;
        }

        if (!paymentMethod) {
            alert(t('checkout.paymentMethodRequired') || 'Please select a payment method');
            return;
        }

        try {
            // Prepare order data - ensure shippingAddress is null/undefined for digital products
            const orderData = {
                paymentMethod: paymentMethod || 'cash_on_delivery', // Ensure paymentMethod is always set
                notes: notes && notes.trim() ? notes.trim() : undefined, // Use undefined instead of null for optional fields
            };

            // Only include shippingAddress if there are physical products and address is selected
            if (hasPhysicalProducts && shippingAddress) {
                orderData.shippingAddress = shippingAddress;
            }

            const result = await dispatch(createOrder(orderData)).unwrap();

            // Clear cart after successful order
            await dispatch(clearCartItems());

            // Redirect to order confirmation
            // API interceptor returns response.data, so result = { success: true, message: '...', data: order }
            // orderSlice returns response.data, so result = { success: true, message: '...', data: order }
            let order = null;
            let orderId = null;

            if (result?.data) {
                // result.data is the order object
                order = result.data;
                orderId = order._id || order.id;
            } else if (result?._id) {
                // result is the order object directly
                order = result;
                orderId = result._id;
            }

            console.log('Order creation result:', { result, order, orderId });

            if (orderId) {
                navigate(`/orders/${orderId}`);
            } else {
                console.warn('Order created but ID not found in response:', result);
                navigate('/orders');
            }
        } catch (err) {
            console.error('Failed to place order:', err);

            // Show detailed error message if available
            const errorMessage = err?.errors?.[0]?.message || err || 'Failed to place order';
            console.error('Validation errors:', err?.errors || err);

            // Error is already in orderError state, but we can show a more detailed message
            if (err?.errors && Array.isArray(err.errors)) {
                const firstError = err.errors[0];
                alert(`${firstError.field || 'Validation'}: ${firstError.message || errorMessage}`);
            }
        }
    };

    if (!isAuthenticated || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
                <Loading />
            </div>
        );
    }

    if (items.length === 0) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('checkout.title') || 'Checkout'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {t('checkout.subtitle') || 'Review your order and complete your purchase'}
                    </p>
                </div>

                {/* Error Messages */}
                {(error || orderError) && (
                    <div className="alert alert-error mb-6">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm sm:text-base font-semibold">
                                {typeof orderError === 'object' ? orderError?.message || 'Validation failed' : orderError || error}
                            </span>
                            {typeof orderError === 'object' && orderError?.errors && orderError.errors.length > 0 && (
                                <ul className="text-xs sm:text-sm list-disc list-inside mt-1">
                                    {orderError.errors.map((err, idx) => (
                                        <li key={idx}>
                                            {err.field}: {err.message}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                        {/* Cart Items Review */}
                        <div className="card shadow-sm border-2" style={{ borderColor, backgroundColor: cardBackgroundColor }}>
                            <div className="card-body p-4">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: primaryTextColor }}>
                                    {t('checkout.orderItems') || 'Order Items'}
                                </h3>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.product?._id || item.product || item._id} className="opacity-75 pointer-events-none">
                                            <CartItem item={item} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {hasPhysicalProducts ? (
                            <AddressSelector
                                selectedAddressId={shippingAddress}
                                onAddressChange={setShippingAddress}
                                hasPhysicalProducts={hasPhysicalProducts}
                            />
                        ) : (
                            <div className="card shadow-sm border-2" style={{ borderColor, backgroundColor: cardBackgroundColor }}>
                                <div className="card-body p-4">
                                    <h3 className="text-lg font-semibold mb-2" style={{ color: primaryTextColor }}>
                                        {t('checkout.shippingAddress') || 'Shipping Address'}
                                    </h3>
                                    <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                        {t('checkout.digitalProductNoAddress') || 'No shipping address required for digital products.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <PaymentMethodSelector
                            selectedMethod={paymentMethod}
                            onMethodChange={setPaymentMethod}
                        />

                        {/* Order Notes (Optional) */}
                        <div className="card shadow-sm border-2" style={{ borderColor, backgroundColor: cardBackgroundColor }}>
                            <div className="card-body p-4">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: primaryTextColor }}>
                                    {t('checkout.orderNotes') || 'Order Notes'} ({t('common.optional') || 'Optional'})
                                </h3>
                                <textarea
                                    className="textarea textarea-bordered w-full border-2"
                                    rows="4"
                                    placeholder={t('checkout.notesPlaceholder') || 'Any special instructions for your order...'}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    style={{ borderColor, color: primaryTextColor, backgroundColor: cardBackgroundColor }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <OrderSummary shipping={shipping} />

                        {/* Place Order Button */}
                        <button
                            className="btn btn-primary btn-lg w-full text-white mt-4 shadow-lg hover:shadow-xl transition-all"
                            style={{ backgroundColor: buttonColor, color: buttonTextColor, borderColor: buttonColor }}
                            onClick={handlePlaceOrder}
                            disabled={orderLoading || (hasPhysicalProducts && !shippingAddress) || !paymentMethod}
                        >
                            {orderLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span className="ml-2">{t('checkout.placingOrder') || 'Placing Order...'}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-2">{t('checkout.placeOrder') || 'Place Order'}</span>
                                </>
                            )}
                        </button>

                        {/* Back to Cart */}
                        <button
                            className="btn btn-outline btn-lg w-full mt-2"
                            style={{ borderColor: buttonColor, color: buttonColor }}
                            onClick={() => navigate('/cart')}
                        >
                            {t('checkout.backToCart') || 'Back to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;

