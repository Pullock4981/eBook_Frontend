/**
 * Affiliate Coupon Section Component
 * 
 * Allows affiliates to generate and manage their own coupons
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAffiliateStatistics,
    selectAffiliateStatistics,
    selectAffiliateLoading
} from '../../store/slices/affiliateSlice';
import { generateAffiliateCoupon, getAffiliateCoupons } from '../../services/affiliateService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loading from '../common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';

function AffiliateCouponSection() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, successColor, warningColor, errorColor, infoColor } = useThemeColors();
    const statistics = useSelector(selectAffiliateStatistics);
    const loading = useSelector(selectAffiliateLoading);
    const [coupons, setCoupons] = useState([]);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'percentage',
        value: 10,
        usageLimit: 100,
        minPurchase: 0,
        maxDiscount: null,
        expiryDate: '',
        description: '',
        oneTimeUse: false
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Calculate affiliate status early
    const affiliate = statistics?.affiliate;
    const isActiveAffiliate = affiliate && affiliate.status === 'active';

    useEffect(() => {
        // Load coupons only if affiliate is active
        if (isActiveAffiliate) {
            loadCoupons();
        }
    }, [statistics?.affiliate?.status]);

    // Listen for custom event to open form
    useEffect(() => {
        const handleOpenForm = () => {
            if (isActiveAffiliate) {
                setShowForm(true);
                // Scroll form into view
                setTimeout(() => {
                    const formElement = document.getElementById('coupon-form');
                    if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        };
        window.addEventListener('openCouponForm', handleOpenForm);
        return () => {
            window.removeEventListener('openCouponForm', handleOpenForm);
        };
    }, [isActiveAffiliate]);

    const loadCoupons = async () => {
        setCouponsLoading(true);
        try {
            const response = await getAffiliateCoupons();
            if (response?.success && response?.data?.coupons) {
                setCoupons(response.data.coupons);
            }
        } catch (err) {
            console.error('Error loading coupons:', err);
        } finally {
            setCouponsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setSubmitLoading(true);

        try {
            const couponData = {
                ...formData,
                expiryDate: formData.expiryDate || null,
                maxDiscount: formData.maxDiscount || null
            };

            const response = await generateAffiliateCoupon(couponData);
            if (response?.success) {
                setSuccess(true);
                setShowForm(false);
                setFormData({
                    type: 'percentage',
                    value: 10,
                    usageLimit: 100,
                    minPurchase: 0,
                    maxDiscount: null,
                    expiryDate: '',
                    description: '',
                    oneTimeUse: false
                });
                loadCoupons();
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (err) {
            setError(err?.message || t('affiliate.failedToGenerateCoupon'));
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        // Show temporary success message
        const btn = document.getElementById(`copy-btn-${code}`);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = t('affiliate.copied');
            btn.style.backgroundColor = successColor;
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = buttonColor;
            }, 2000);
        }
    };

    // If still loading and no statistics yet, show a simple loading state
    if (loading && !statistics) {
        return (
            <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                <div className="flex justify-center py-8">
                    <Loading />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                            {t('affiliate.myCoupons')}
                        </h2>
                        <p className="text-xs sm:text-sm mt-1" style={{ color: secondaryTextColor }}>
                            {t('affiliate.generateAndManage')}
                        </p>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isActiveAffiliate) {
                                setShowForm(!showForm);
                                // Scroll to form when opening
                                if (!showForm) {
                                    setTimeout(() => {
                                        const formElement = document.getElementById('coupon-form');
                                        if (formElement) {
                                            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }, 200);
                                }
                            } else {
                                // Show message if not active
                                alert(t('affiliate.onlyActiveAffiliates'));
                            }
                        }}
                        className="btn px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md"
                        style={{
                            backgroundColor: isActiveAffiliate ? buttonColor : secondaryTextColor,
                            minHeight: '44px',
                            opacity: isActiveAffiliate ? 1 : 0.7,
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            zIndex: 10,
                            position: 'relative',
                            border: 'none',
                            outline: 'none'
                        }}
                        type="button"
                        onMouseEnter={(e) => {
                            if (isActiveAffiliate) {
                                e.currentTarget.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                                e.currentTarget.style.transform = 'scale(1.02)';
                            } else {
                                e.currentTarget.style.opacity = '0.8';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (isActiveAffiliate) {
                                e.currentTarget.style.backgroundColor = buttonColor;
                                e.currentTarget.style.transform = 'scale(1)';
                            } else {
                                e.currentTarget.style.opacity = '0.7';
                            }
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {showForm ? t('common.cancel') : t('affiliate.generateCoupon')}
                    </button>
                </div>
            </div>

            {/* Show message if not active affiliate */}
            {!isActiveAffiliate && statistics && (
                <div className="rounded-lg shadow-sm p-4 sm:p-6 border mb-6" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="text-center py-4">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: secondaryTextColor }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <p className="text-sm sm:text-base font-medium mb-1" style={{ color: primaryTextColor }}>
                            {!affiliate ? t('affiliate.affiliateAccountNotFound') : t('affiliate.affiliateStatus', { status: affiliate.status })}
                        </p>
                        <p className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                            {!affiliate
                                ? t('affiliate.pleaseRegisterAffiliate')
                                : affiliate.status === 'pending'
                                    ? t('affiliate.registrationPendingApproval')
                                    : t('affiliate.onlyActiveAffiliates')}
                        </p>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-3 sm:p-4 rounded-lg border" style={{ backgroundColor: successColor + '20', borderColor: successColor }}>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: successColor }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm sm:text-base font-medium" style={{ color: successColor }}>
                            {t('affiliate.couponGeneratedSuccess')}
                        </p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 sm:p-4 rounded-lg border" style={{ backgroundColor: errorColor + '20', borderColor: errorColor }}>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: errorColor }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-sm sm:text-base font-medium" style={{ color: errorColor }}>
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Generate Coupon Form */}
            {showForm && isActiveAffiliate && (
                <div id="coupon-form" className="mb-6 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <h3 className="text-base sm:text-lg font-bold mb-4" style={{ color: primaryTextColor }}>
                        {t('affiliate.generateNewCoupon')}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {t('affiliate.couponType')} <span style={{ color: errorColor }}>*</span>
                                    </span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="select select-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    required
                                >
                                    <option value="percentage">{t('coupon.percentage')}</option>
                                    <option value="fixed">{t('coupon.fixed')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {formData.type === 'percentage' ? t('affiliate.discountPercentage') : t('affiliate.discountAmount')} <span style={{ color: errorColor }}>*</span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    min="0"
                                    max={formData.type === 'percentage' ? 100 : undefined}
                                    step={formData.type === 'percentage' ? '1' : '0.01'}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {t('affiliate.usageLimit')} <span style={{ color: errorColor }}>*</span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {t('affiliate.minimumPurchase')}
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    name="minPurchase"
                                    value={formData.minPurchase}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                />
                            </div>
                        </div>

                        {formData.type === 'percentage' && (
                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        {t('affiliate.maxDiscount')}
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount || ''}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder={t('common.optional')}
                                />
                            </div>
                        )}

                        <div>
                            <label className="label">
                                <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                    {t('affiliate.expiryDate')}
                                </span>
                            </label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                    {t('affiliate.description')}
                                </span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="textarea textarea-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor }}
                                placeholder={t('affiliate.enterCouponDescription')}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-3">
                                <input
                                    type="checkbox"
                                    name="oneTimeUse"
                                    checked={formData.oneTimeUse}
                                    onChange={handleInputChange}
                                    className="checkbox"
                                    style={{ borderColor: secondaryTextColor }}
                                />
                                <span className="label-text text-sm sm:text-base" style={{ color: primaryTextColor }}>
                                    {t('affiliate.oneTimeUse')}
                                </span>
                            </label>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="btn flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: buttonColor, minHeight: '48px' }}
                                onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.backgroundColor = buttonColor;
                                    }
                                }}
                            >
                                {submitLoading ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    t('affiliate.generateCouponButton')
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setError(null);
                                }}
                                className="btn flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 hover:shadow-md"
                                style={{ backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, borderWidth: '1px', minHeight: '48px' }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = secondaryTextColor + '20';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = backgroundColor;
                                }}
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons List */}
            <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                {couponsLoading ? (
                    <div className="flex justify-center py-8">
                        <Loading />
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: secondaryTextColor }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p className="text-sm sm:text-base" style={{ color: secondaryTextColor }}>
                            {t('affiliate.noCouponsYet')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className="rounded-lg border p-4 sm:p-5 transition-all duration-200 hover:shadow-md"
                                style={{ borderColor: secondaryTextColor, backgroundColor }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg sm:text-xl font-bold font-mono" style={{ color: successColor }}>
                                                {coupon.code}
                                            </span>
                                            {coupon.isActive ? (
                                                <span className="badge badge-sm badge-success">{t('affiliate.active')}</span>
                                            ) : (
                                                <span className="badge badge-sm badge-error">{t('affiliate.inactive')}</span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold mb-1" style={{ color: primaryTextColor }}>
                                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `${formatCurrency(coupon.value)} OFF`}
                                        </p>
                                        {coupon.description && (
                                            <p className="text-xs sm:text-sm mb-2" style={{ color: secondaryTextColor }}>
                                                {coupon.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span style={{ color: secondaryTextColor }}>{t('affiliate.used')}:</span>
                                        <span style={{ color: primaryTextColor }}>
                                            {coupon.usedCount} / {coupon.usageLimit}
                                        </span>
                                    </div>
                                    {coupon.minPurchase > 0 && (
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span style={{ color: secondaryTextColor }}>{t('affiliate.minimumPurchase')}:</span>
                                            <span style={{ color: primaryTextColor }}>{formatCurrency(coupon.minPurchase)}</span>
                                        </div>
                                    )}
                                    {coupon.expiryDate && (
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <span style={{ color: secondaryTextColor }}>{t('affiliate.expires')}:</span>
                                            <span style={{ color: warningColor }}>{formatDate(coupon.expiryDate)}</span>
                                        </div>
                                    )}
                                    {coupon.oneTimeUse && (
                                        <div className="flex items-center gap-1 text-xs sm:text-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: infoColor }}>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span style={{ color: infoColor }}>{t('affiliate.oneTimeUse')}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    id={`copy-btn-${coupon.code}`}
                                    onClick={() => handleCopyCode(coupon.code)}
                                    className="btn btn-sm w-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all duration-200"
                                    style={{ backgroundColor: buttonColor, minHeight: '36px' }}
                                    onMouseEnter={(e) => {
                                        if (e.target.textContent !== t('affiliate.copied')) {
                                            e.target.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (e.target.textContent !== t('affiliate.copied')) {
                                            e.target.style.backgroundColor = buttonColor;
                                        }
                                    }}
                                >
                                    {t('affiliate.copyCode')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AffiliateCouponSection;

