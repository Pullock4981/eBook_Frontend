/**
 * Coupon Banner Component
 * 
 * Displays active coupons in a banner/card format
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchActiveCoupons } from '../../store/slices/couponSlice';
import { formatCurrency, formatDate } from '../../utils/helpers';

function CouponBanner() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadActiveCoupons = async () => {
            try {
                setIsLoading(true);
                const result = await dispatch(fetchActiveCoupons({ limit: 5 })).unwrap();
                const couponList = result.coupons || result.data || (Array.isArray(result) ? result : []);
                setCoupons(couponList);
            } catch (error) {
                console.error('Failed to load active coupons:', error);
                setCoupons([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadActiveCoupons();
    }, [dispatch]);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        // Show toast notification (you can add a toast library later)
        alert(t('coupon.codeCopied') || `Coupon code "${code}" copied to clipboard!`);
    };

    const getDiscountDisplay = (coupon) => {
        if (coupon.type === 'percentage') {
            return `${coupon.value}%${coupon.maxDiscount ? ` (Max ${formatCurrency(coupon.maxDiscount)})` : ''}`;
        }
        return formatCurrency(coupon.value);
    };

    if (isLoading) {
        return null; // Don't show anything while loading
    }

    if (coupons.length === 0) {
        return null; // Don't show banner if no coupons
    }

    return (
        <div className="w-full mb-4 sm:mb-5 md:mb-6">
            <div className="card bg-base-100 border-2 shadow-md" style={{ borderColor: '#e2e8f0' }}>
                <div className="card-body p-3 sm:p-4 md:p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1E293B' }}>
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate" style={{ color: '#1E293B' }}>
                                {t('coupon.availableCoupons') || 'Available Coupons'}
                            </h2>
                        </div>
                    </div>

                    {/* Coupons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon._id}
                                className="bg-white border rounded-lg hover:shadow-md transition-all cursor-pointer"
                                style={{ borderColor: '#e2e8f0' }}
                                onClick={() => navigate('/cart')}
                            >
                                <div className="p-3 sm:p-4">
                                    {/* Discount Badge */}
                                    <div className="flex items-center justify-between mb-2 gap-2">
                                        <span className="text-xs font-semibold text-white px-2 py-1 rounded flex-shrink-0" style={{ backgroundColor: '#1E293B' }}>
                                            {getDiscountDisplay(coupon)}
                                        </span>
                                        {coupon.type === 'percentage' && (
                                            <span className="text-xs font-medium px-2 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                                {t('coupon.off') || 'OFF'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Coupon Code */}
                                    <div className="mb-2">
                                        <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>
                                            {t('coupon.code') || 'Code'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm truncate flex-1" style={{ color: '#1E293B' }}>
                                                {coupon.code}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyCode(coupon.code);
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded flex-shrink-0 transition-colors"
                                                style={{ color: '#64748b' }}
                                                title={t('coupon.copyCode') || 'Copy code'}
                                            >
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expiry Date */}
                                    {coupon.expiryDate && (
                                        <div className="mb-2">
                                            <p className="text-xs" style={{ color: '#94a3b8' }}>
                                                Expires: <span className="font-medium" style={{ color: '#64748b' }}>{formatDate(coupon.expiryDate)}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Usage Info */}
                                    <div className="pt-2 border-t" style={{ borderColor: '#f1f5f9' }}>
                                        <p className="text-xs" style={{ color: '#94a3b8' }}>
                                            {coupon.usedCount || 0} / {coupon.usageLimit} {t('coupon.used') || 'used'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View Cart CTA */}
                    {coupons.length > 0 && (
                        <div className="mt-3 sm:mt-4 md:mt-5 text-center">
                            <button
                                onClick={() => navigate('/cart')}
                                className="btn btn-sm sm:btn-md btn-primary text-white px-4 sm:px-6 py-2 sm:py-2.5"
                                style={{ backgroundColor: '#1E293B' }}
                            >
                                {t('coupon.useInCart') || 'Use in Cart'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CouponBanner;

