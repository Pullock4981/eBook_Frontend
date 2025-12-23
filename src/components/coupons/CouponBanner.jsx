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
import { useThemeColors } from '../../hooks/useThemeColors';
import { showSuccess } from '../../utils/toast';

function CouponBanner() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
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
        showSuccess(t('coupon.codeCopied') || `Coupon code "${code}" copied to clipboard!`);
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
        <div className="w-full mb-3 sm:mb-4">
            <div className="card bg-base-100 border shadow-sm" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <div className="card-body p-2 sm:p-3 md:p-4">
                    {/* Header - Minimal */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: buttonColor }}>
                                <svg
                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white"
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
                            <h2 className="text-xs sm:text-sm md:text-base font-semibold truncate" style={{ color: primaryTextColor }}>
                                {t('coupon.availableCoupons') || 'Available Coupons'}
                            </h2>
                        </div>
                    </div>

                    {/* Coupons Grid - Compact */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {coupons.slice(0, 5).map((coupon) => (
                            <div
                                key={coupon._id}
                                className="bg-base-200 border rounded-md hover:shadow-sm transition-all cursor-pointer"
                                style={{ borderColor: secondaryTextColor, backgroundColor }}
                                onClick={() => navigate('/cart')}
                            >
                                <div className="p-2">
                                    {/* Discount Badge - Compact */}
                                    <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-1 flex-wrap">
                                        <span className="text-[10px] sm:text-xs font-semibold text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0" style={{ backgroundColor: buttonColor }}>
                                            {getDiscountDisplay(coupon)}
                                        </span>
                                        {coupon.type === 'percentage' && (
                                            <span className="text-[10px] sm:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                                                {t('coupon.off') || 'OFF'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Coupon Code - Compact */}
                                    <div className="mb-1.5 sm:mb-2">
                                        <p className="text-[10px] sm:text-xs mb-0.5 opacity-70" style={{ color: secondaryTextColor }}>
                                            {t('coupon.code') || 'Code'}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <p className="font-bold text-xs sm:text-sm truncate flex-1" style={{ color: primaryTextColor }}>
                                                {coupon.code}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyCode(coupon.code);
                                                }}
                                                className="p-0.5 sm:p-1 hover:opacity-70 rounded flex-shrink-0 transition-opacity"
                                                style={{ color: secondaryTextColor }}
                                                title={t('coupon.copyCode') || 'Copy code'}
                                            >
                                                <svg
                                                    className="w-3 h-3 sm:w-4 sm:h-4"
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

                                    {/* Expiry Date - Compact */}
                                    {coupon.expiryDate && (
                                        <div className="mb-1 sm:mb-1.5">
                                            <p className="text-[10px] sm:text-xs opacity-70" style={{ color: secondaryTextColor }}>
                                                Exp: <span className="font-medium">{formatDate(coupon.expiryDate)}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Usage Info - Compact */}
                                    <div className="pt-1 sm:pt-1.5 border-t" style={{ borderColor: secondaryTextColor }}>
                                        <p className="text-[10px] sm:text-xs opacity-70" style={{ color: secondaryTextColor }}>
                                            {coupon.usedCount || 0}/{coupon.usageLimit}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View Cart CTA - Compact */}
                    {coupons.length > 0 && (
                        <div className="mt-2 sm:mt-3 text-center">
                            <button
                                onClick={() => navigate('/cart')}
                                className="btn btn-xs sm:btn-sm btn-primary text-white px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm"
                                style={{ backgroundColor: buttonColor }}
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

