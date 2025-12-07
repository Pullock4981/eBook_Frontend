/**
 * Cart Summary Component
 * 
 * Displays cart totals, coupon section, and checkout button
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { applyCouponCode, removeCouponCode, selectCart, selectCartItemCount } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils/helpers';
import { Link } from 'react-router-dom';

function CartSummary() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { subtotal, discount, total, coupon, isLoading } = useSelector(selectCart);
    const itemCount = useSelector(selectCartItemCount);

    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState(null);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) {
            setCouponError(t('cart.couponCodeRequired') || 'Coupon code is required');
            return;
        }

        setIsApplyingCoupon(true);
        setCouponError(null);
        try {
            await dispatch(applyCouponCode(couponCode.trim().toUpperCase())).unwrap();
            setCouponCode('');
        } catch (error) {
            // Extract error message from different error formats
            let errorMessage = t('cart.invalidCoupon') || 'Invalid coupon code';
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            setCouponError(errorMessage);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = async () => {
        try {
            await dispatch(removeCouponCode()).unwrap();
        } catch (error) {
            console.error('Failed to remove coupon:', error);
        }
    };

    return (
        <div className="card bg-base-100 shadow-lg border-2 sticky top-16 sm:top-20" style={{ borderColor: '#e2e8f0' }}>
            <div className="card-body p-3 sm:p-4 md:p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#1E293B' }}>
                    {t('cart.orderSummary') || 'Order Summary'}
                </h2>

                {/* Coupon Section */}
                {!coupon ? (
                    <div className="mb-3 sm:mb-4">
                        <form onSubmit={handleApplyCoupon} className="space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder={t('cart.enterCouponCode') || 'Enter coupon code'}
                                    className="input input-bordered flex-grow border-2 text-sm sm:text-base px-3 sm:px-4"
                                    value={couponCode}
                                    onChange={(e) => {
                                        setCouponCode(e.target.value);
                                        setCouponError(null);
                                    }}
                                    style={{ borderColor: '#cbd5e1', color: '#1E293B' }}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary text-white px-4 sm:px-6"
                                    disabled={isApplyingCoupon || isLoading}
                                    style={{ backgroundColor: '#1E293B' }}
                                >
                                    {isApplyingCoupon ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        t('cart.apply') || 'Apply'
                                    )}
                                </button>
                            </div>
                            {couponError && (
                                <p className="text-sm text-error">{couponError}</p>
                            )}
                        </form>
                    </div>
                ) : (
                    <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-success">
                                    {t('cart.couponApplied') || 'Coupon Applied'}
                                </p>
                                <p className="text-xs opacity-70" style={{ color: '#2d3748' }}>
                                    {coupon?.code || (typeof coupon === 'string' ? coupon : 'N/A')}
                                </p>
                                {discount > 0 && (
                                    <p className="text-xs font-semibold text-success mt-1">
                                        {t('cart.savings') || 'Savings'}: {formatCurrency(discount)}
                                    </p>
                                )}
                            </div>
                            <button
                                className="btn btn-sm btn-ghost text-error px-3 sm:px-4"
                                onClick={handleRemoveCoupon}
                                disabled={isLoading}
                                title={t('cart.removeCoupon') || 'Remove coupon'}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Summary Details */}
                <div className="space-y-2 sm:space-y-3 border-t border-b py-3 sm:py-4" style={{ borderColor: '#e2e8f0' }}>
                    <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base" style={{ color: '#2d3748' }}>
                            {t('cart.subtotal') || 'Subtotal'}
                        </span>
                        <span className="text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                            {formatCurrency(subtotal)}
                        </span>
                    </div>
                    {(discount > 0 || coupon) && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base text-success">
                                {t('cart.discount') || 'Discount'}
                                {coupon && (
                                    <span className="text-xs opacity-70 ml-1">
                                        ({coupon?.code || (typeof coupon === 'string' ? coupon : '')})
                                    </span>
                                )}
                            </span>
                            <span className="text-sm sm:text-base font-semibold text-success">
                                -{formatCurrency(discount || 0)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 sm:pt-4">
                    <span className="text-lg sm:text-xl font-bold" style={{ color: '#1E293B' }}>
                        {t('cart.total') || 'Total'}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: '#1E293B' }}>
                        {formatCurrency(total)}
                    </span>
                </div>

                {/* Item Count Display */}
                <div className="text-center pt-2 pb-1">
                    <span className="text-xs sm:text-sm opacity-70" style={{ color: '#2d3748' }}>
                        {t('cart.totalItems', { count: itemCount }) || `${itemCount} item(s) total`}
                    </span>
                </div>

                {/* Checkout Button */}
                <Link
                    to="/checkout"
                    className="btn btn-primary btn-md sm:btn-lg w-full text-white mt-4 shadow-lg hover:shadow-xl transition-all px-4 sm:px-6"
                    style={{ backgroundColor: '#1E293B' }}
                >
                    {t('cart.proceedToCheckout') || 'Proceed to Checkout'}
                </Link>

                {/* Continue Shopping */}
                <Link
                    to="/products"
                    className="btn btn-outline btn-md sm:btn-lg w-full mt-2 px-4 sm:px-6"
                    style={{ borderColor: '#1E293B', color: '#1E293B' }}
                >
                    {t('cart.continueShopping') || 'Continue Shopping'}
                </Link>
            </div>
        </div>
    );
}

export default CartSummary;

