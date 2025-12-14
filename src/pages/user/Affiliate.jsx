/**
 * Affiliate Dashboard Page
 * 
 * Main dashboard for affiliate users showing statistics and referral link
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    fetchAffiliateStatistics,
    fetchCommissions,
    selectAffiliateStatistics,
    selectCommissions,
    selectAffiliateLoading
} from '../../store/slices/affiliateSlice';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';
import AffiliateCouponSection from '../../components/affiliate/AffiliateCouponSection';

function AffiliateDashboard() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, successColor, warningColor, infoColor } = useThemeColors();
    const statistics = useSelector(selectAffiliateStatistics);
    const commissions = useSelector(selectCommissions);
    const loading = useSelector(selectAffiliateLoading);

    useEffect(() => {
        dispatch(fetchAffiliateStatistics());
        dispatch(fetchCommissions({ status: 'pending' }, 1, 5));
    }, [dispatch]);

    if (loading && !statistics) {
        return (
            <div className="flex items-center justify-center py-12" style={{ backgroundColor }}>
                <Loading />
            </div>
        );
    }

    const affiliate = statistics?.affiliate;

    return (
        <div className="w-full pb-4" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('nav.affiliateDashboard')}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {t('affiliate.trackCommissionsFeature')}
                    </p>
                </div>

                {/* Add New Coupon Section */}
                {affiliate && (
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                                <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: primaryTextColor }}>
                                    {t('affiliate.addNewCoupon')}
                                </h2>
                                <p className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                    {t('affiliate.generateNewCouponDescription')}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    // Scroll to coupons section and trigger form open
                                    setTimeout(() => {
                                        document.getElementById('coupons-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        const event = new CustomEvent('openCouponForm');
                                        window.dispatchEvent(event);
                                    }, 100);
                                }}
                                className="btn px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md inline-flex items-center gap-2 whitespace-nowrap"
                                style={{ backgroundColor: buttonColor, minHeight: '44px' }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = buttonColor;
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {t('affiliate.generateNewCoupon')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Affiliate Coupons Section */}
                <div id="coupons-section" className="mb-6 sm:mb-8">
                    <AffiliateCouponSection />
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Total Commission */}
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                    {t('affiliate.totalCommission') || 'Total Commission'}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: successColor }}>
                                    {formatCurrency(affiliate?.totalCommission || 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: successColor + '20' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: successColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Pending Commission */}
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                    {t('affiliate.pending')}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: warningColor }}>
                                    {formatCurrency(affiliate?.pendingCommission || 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: warningColor + '20' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: warningColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Paid Commission */}
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                    {t('affiliate.paid')}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: successColor }}>
                                    {formatCurrency(affiliate?.paidCommission || 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: successColor + '20' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: successColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Referrals */}
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                    {t('affiliate.totalReferrals')}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                    {affiliate?.totalReferrals || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: infoColor + '20' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: infoColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Commissions */}
                <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                            {t('affiliate.recentCommissions')}
                        </h2>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loading />
                        </div>
                    ) : commissions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm sm:text-base" style={{ color: secondaryTextColor }}>
                                {t('affiliate.noCommissionsYet')}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr style={{ backgroundColor: buttonColor }}>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.orderId')}</th>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.amount')}</th>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.commission')}</th>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.status')}</th>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-2 sm:px-4 text-white">{t('affiliate.date')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissions.slice(0, 5).map((commission) => (
                                        <tr key={commission.id} className="border-b transition-colors" style={{ borderColor: secondaryTextColor }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = secondaryTextColor + '10';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <td className="py-3 px-2 sm:px-4">
                                                <span className="text-xs sm:text-sm font-mono font-medium" style={{ color: primaryTextColor }}>
                                                    {commission.order?.orderId || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                    {formatCurrency(commission.orderAmount)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <span className="text-xs sm:text-sm font-semibold" style={{ color: successColor }}>
                                                    {formatCurrency(commission.amount)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <span className={`badge badge-sm ${commission.status === 'paid' ? 'badge-success' :
                                                    commission.status === 'approved' ? 'badge-info' :
                                                        'badge-warning'
                                                    }`}>
                                                    {commission.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                    {formatDate(commission.createdAt)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <Link
                        to="/dashboard/affiliate/withdraw"
                        className="btn btn-lg w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md"
                        style={{ backgroundColor: buttonColor, minHeight: '48px' }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = buttonColor;
                        }}
                    >
                        {t('affiliate.requestWithdraw')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AffiliateDashboard;

