/**
 * Coupon Section Component
 * Displays active coupons on home page
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/helpers';
import Loading from '../common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';

function CouponSection({ coupons, seeMoreLink, loading }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor } = useThemeColors();

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(t('coupon.codeCopied') || `Coupon code "${code}" copied to clipboard!`);
    };

    const getDiscountDisplay = (coupon) => {
        if (coupon.type === 'percentage') {
            return `${coupon.value}%${coupon.maxDiscount ? ` (Max ${formatCurrency(coupon.maxDiscount)})` : ''}`;
        }
        return formatCurrency(coupon.value);
    };

    if (loading) {
        return (
            <section className="py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center py-12">
                        <Loading />
                    </div>
                </div>
            </section>
        );
    }

    if (!coupons || coupons.length === 0) {
        return null;
    }

    return (
        <section className="py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: primaryTextColor }}>
                        {t('home.sections.coupons') || 'Special Offers'}
                    </h2>
                    {seeMoreLink && (
                        <Link
                            to={seeMoreLink}
                            className="btn btn-sm sm:btn-md px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md whitespace-nowrap"
                            style={{ backgroundColor: buttonColor, minHeight: '40px' }}
                            onMouseEnter={(e) => {
                                const isDark = buttonColor === '#6B8E6B';
                                e.target.style.backgroundColor = isDark ? '#5a7a5a' : '#0f172a';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = buttonColor;
                            }}
                        >
                            {t('home.seeMore') || 'See More'}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    )}
                </div>

                {/* Coupons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {coupons.map((coupon) => (
                        <div
                            key={coupon._id || coupon.id}
                            className="bg-gradient-to-br from-[#6B8E6B] to-[#5a7a5a] rounded-lg shadow-md p-6 text-white relative overflow-hidden"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>

                            <div className="relative z-10">
                                {/* Discount Badge */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-3xl sm:text-4xl font-bold">
                                        {getDiscountDisplay(coupon)}
                                    </div>
                                    <div className="text-xs sm:text-sm opacity-90">
                                        {coupon.type === 'percentage' ? t('coupon.off') || 'OFF' : t('coupon.discount') || 'DISCOUNT'}
                                    </div>
                                </div>

                                {/* Coupon Code */}
                                <div className="mb-4">
                                    <p className="text-xs sm:text-sm opacity-90 mb-2">
                                        {t('coupon.code') || 'Coupon Code'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-white bg-opacity-20 px-3 py-2 rounded text-lg font-bold flex-1 text-center">
                                            {coupon.code}
                                        </code>
                                        <button
                                            onClick={() => handleCopyCode(coupon.code)}
                                            className="btn btn-sm px-3 py-2 text-white border-2 border-white border-opacity-50 hover:bg-white hover:bg-opacity-20 transition-all"
                                            style={{ minHeight: '36px' }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Coupon Details */}
                                {coupon.description && (
                                    <p className="text-xs sm:text-sm opacity-90 mb-2 line-clamp-2">
                                        {coupon.description}
                                    </p>
                                )}

                                {/* Minimum Amount */}
                                {coupon.minAmount && (
                                    <p className="text-xs opacity-75">
                                        {t('coupon.minPurchase') || 'Min. purchase'}: {formatCurrency(coupon.minAmount)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CouponSection;

