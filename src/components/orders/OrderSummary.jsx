/**
 * Order Summary Component
 * 
 * Displays order summary during checkout
 */

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectCart } from '../../store/slices/cartSlice';
import { formatCurrency } from '../../utils/helpers';

function OrderSummary({ shipping = 0 }) {
    const { t } = useTranslation();
    const { subtotal, discount, total, coupon, items } = useSelector(selectCart);

    // Calculate final total with shipping
    const finalTotal = total + shipping;

    return (
        <div className="card bg-base-100 shadow-lg border-2 sticky top-16 sm:top-20" style={{ borderColor: '#e2e8f0' }}>
            <div className="card-body p-3 sm:p-4 md:p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#1E293B' }}>
                    {t('checkout.orderSummary') || 'Order Summary'}
                </h2>

                {/* Items Count */}
                <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b" style={{ borderColor: '#e2e8f0' }}>
                    <p className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                        {t('checkout.itemsCount', { count: items?.length || 0 }) || `${items?.length || 0} item(s)`}
                    </p>
                </div>

                {/* Coupon Applied */}
                {coupon && (
                    <div className="mb-3 sm:mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-success">
                                    {t('cart.couponApplied') || 'Coupon Applied'}
                                </p>
                                <p className="text-xs opacity-70" style={{ color: '#2d3748' }}>
                                    {coupon.code || coupon}
                                </p>
                            </div>
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
                    {discount > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base text-success">
                                {t('cart.discount') || 'Discount'}
                            </span>
                            <span className="text-sm sm:text-base font-semibold text-success">
                                -{formatCurrency(discount)}
                            </span>
                        </div>
                    )}
                    {shipping > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base" style={{ color: '#2d3748' }}>
                                {t('checkout.shipping') || 'Shipping'}
                            </span>
                            <span className="text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                {formatCurrency(shipping)}
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
                        {formatCurrency(finalTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default OrderSummary;

