/**
 * User Dashboard Page
 * 
 * Main dashboard for authenticated users
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { fetchUserProfile, selectUserProfile, fetchAddresses, selectUserAddresses } from '../../store/slices/userSlice';
import { fetchUserOrders, selectOrders, selectOrdersLoading } from '../../store/slices/orderSlice';
import { fetchUserEBooks, selectEBooks, fetcheBookAccess, selectAccessToken } from '../../store/slices/ebookSlice';
import {
    fetchAffiliateProfile,
    fetchAffiliateStatistics,
    cancelAffiliateRegistration,
    selectAffiliate,
    selectAffiliateStatistics,
    selectIsAffiliate,
    selectAffiliateStatus
} from '../../store/slices/affiliateSlice';
import Loading from '../../components/common/Loading';
import SecurePDFViewer from '../../components/ebook/SecurePDFViewer';
import AffiliateRegistrationModal from '../../components/affiliate/AffiliateRegistrationModal';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { getPDFURL } from '../../services/ebookService';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getAffiliateCoupons } from '../../services/affiliateService';
import { showError, showSuccess } from '../../utils/toast';
import Swal from 'sweetalert2';

function Dashboard() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, successColor, warningColor, errorColor } = useThemeColors();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const profile = useSelector(selectUserProfile);
    const addresses = useSelector(selectUserAddresses);
    const orders = useSelector(selectOrders);
    const ordersLoading = useSelector(selectOrdersLoading);
    const eBooks = useSelector(selectEBooks);
    const [selectedEBook, setSelectedEBook] = useState(null);
    const [showViewer, setShowViewer] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showAffiliateBanner, setShowAffiliateBanner] = useState(() => {
        // Check localStorage on mount - only dismiss if explicitly dismissed
        // Use user-specific key to allow per-user dismissal
        const userId = user?.id || user?._id || 'default';
        const dismissed = localStorage.getItem(`affiliateBannerDismissed_${userId}`);
        return dismissed !== 'true';
    });
    const isAffiliate = useSelector(selectIsAffiliate);
    const affiliateStatus = useSelector(selectAffiliateStatus);
    const affiliateStats = useSelector(selectAffiliateStatistics);
    const affiliate = useSelector(selectAffiliate);
    const [activeCouponCode, setActiveCouponCode] = useState(null);
    const [loadingCoupon, setLoadingCoupon] = useState(false);

    // Reset banner state when user changes
    useEffect(() => {
        if (user?.id || user?._id) {
            const userId = user?.id || user?._id || 'default';
            const dismissed = localStorage.getItem(`affiliateBannerDismissed_${userId}`);
            setShowAffiliateBanner(dismissed !== 'true');
        }
    }, [user?.id, user?._id]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchUserProfile());
        dispatch(fetchAddresses());
        dispatch(fetchUserOrders({ page: 1, limit: 5 })); // Get recent 5 orders
        dispatch(fetchUserEBooks());

        // Check affiliate status - if user is already affiliated, fetch statistics
        dispatch(fetchAffiliateProfile()).then((result) => {
            if (result.type === 'affiliate/fetchProfile/fulfilled') {
                const affiliate = result.payload?.affiliate || result.payload?.data?.affiliate;
                if (affiliate?.status === 'active') {
                    // Fetch statistics for active affiliates (but don't redirect)
                    dispatch(fetchAffiliateStatistics());
                }
            }
        }).catch((error) => {
            // Silently handle - user is not affiliate (expected for most users)
        });
    }, [dispatch, isAuthenticated, navigate]);

    // Load active coupon code function
    const loadActiveCoupon = async () => {
        if (!isAffiliate || affiliateStatus !== 'active') {
            return;
        }
        
        setLoadingCoupon(true);
        try {
            const response = await getAffiliateCoupons(1, 100);
            console.log('Dashboard - loadActiveCoupon - Full response:', response);
            
            // Handle different response structures
            let couponsList = [];
            if (response?.success && response?.data) {
                if (Array.isArray(response.data.coupons)) {
                    couponsList = response.data.coupons;
                } else if (Array.isArray(response.data)) {
                    couponsList = response.data;
                } else if (response.data?.data && Array.isArray(response.data.data)) {
                    couponsList = response.data.data;
                }
            } else if (Array.isArray(response?.coupons)) {
                couponsList = response.coupons;
            } else if (Array.isArray(response)) {
                couponsList = response;
            }
            
            // Find the first approved and active coupon
            const activeCoupon = couponsList.find(c => 
                c.approvalStatus === 'approved' && c.isActive === true
            );
            
            if (activeCoupon && activeCoupon.code) {
                console.log('Dashboard - Setting active coupon code:', activeCoupon.code);
                setActiveCouponCode(activeCoupon.code);
            } else {
                setActiveCouponCode(null);
            }
        } catch (error) {
            console.error('Dashboard - Error loading active coupon:', error);
            setActiveCouponCode(null);
        } finally {
            setLoadingCoupon(false);
        }
    };

    // Reload active coupon when affiliate status changes
    useEffect(() => {
        if (isAffiliate && affiliateStatus === 'active') {
            loadActiveCoupon();
        }
    }, [isAffiliate, affiliateStatus]);

    // Affiliate auto-refresh DISABLED - No need to check affiliate status
    // Most users are not affiliates, so we skip this check to avoid 404 errors
    // useEffect(() => {
    //     if (!isAuthenticated) return;
    //     const checkAffiliateStatus = () => {
    //         dispatch(fetchAffiliateProfile()).then((result) => {
    //             if (result.type === 'affiliate/fetchProfile/fulfilled') {
    //                 const newStatus = result.payload?.affiliate?.status || result.payload?.data?.affiliate?.status;
    //                 const currentStatus = affiliateStatus;
    //                 if (newStatus === 'active' && currentStatus !== 'active') {
    //                     dispatch(fetchAffiliateStatistics());
    //                 }
    //             }
    //         }).catch(() => {});
    //     };
    //     checkAffiliateStatus();
    //     const interval = setInterval(checkAffiliateStatus, 30000);
    //     return () => clearInterval(interval);
    // }, [dispatch, isAuthenticated, affiliateStatus]);

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    const recentOrders = orders.slice(0, 5);
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const totalEBooks = eBooks.length;


    return (
        <div className="w-full pb-4" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Welcome Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('user.welcome') || 'Welcome'}, {(() => {
                            // Get user name from profile (database) or authSlice user
                            const userName = profile?.profile?.name || profile?.name || user?.profile?.name || '';
                            return userName || user?.mobile || 'User';
                        })()}!
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {t('user.dashboardDescription') || 'Manage your account, orders, and eBooks'}
                    </p>
                </div>

                {/* Affiliate Registration Banner - Show if not affiliate and banner not dismissed */}
                {/* Show banner if: user is NOT affiliate (false or undefined), banner not dismissed, and status is not pending */}
                {((isAffiliate === false || isAffiliate === undefined || !isAffiliate) && affiliateStatus !== 'pending' && showAffiliateBanner) && (
                    <div className="bg-gradient-to-r rounded-lg shadow-sm p-4 sm:p-6 mb-6 border-2 relative" style={{
                        background: buttonColor === '#6B8E6B'
                            ? `linear-gradient(135deg, ${successColor}20 0%, ${successColor}30 100%)`
                            : `linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)`,
                        borderColor: buttonColor,
                        backgroundColor: buttonColor === '#6B8E6B' ? backgroundColor : undefined
                    }}>
                        {/* Close/Dismiss Button */}
                        <button
                            onClick={() => {
                                setShowAffiliateBanner(false);
                                const userId = user?.id || user?._id || 'default';
                                localStorage.setItem(`affiliateBannerDismissed_${userId}`, 'true');
                            }}
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 btn btn-sm btn-circle btn-ghost opacity-70 hover:opacity-100"
                            style={{ color: primaryTextColor }}
                            aria-label="Dismiss banner"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8 sm:pr-10">
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: primaryTextColor }}>
                                    {t('affiliate.becomeAffiliate')}
                                </h3>
                                <p className="text-sm sm:text-base" style={{ color: secondaryTextColor }}>
                                    {t('affiliate.becomeAffiliateDescription')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowRegistrationModal(true)}
                                    className="btn px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md whitespace-nowrap"
                                    style={{ backgroundColor: buttonColor, minHeight: '44px' }}
                                    onMouseEnter={(e) => {
                                        const isDark = buttonColor === '#6B8E6B';
                                        e.target.style.backgroundColor = isDark ? '#5a7a5a' : '#0f172a';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = buttonColor;
                                    }}
                                >
                                    {t('affiliate.registerNow')}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAffiliateBanner(false);
                                        const userId = user?.id || user?._id || 'default';
                                        localStorage.setItem(`affiliateBannerDismissed_${userId}`, 'true');
                                    }}
                                    className="btn px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 hover:shadow-md whitespace-nowrap"
                                    style={{ backgroundColor: backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, minHeight: '44px' }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = secondaryTextColor + '20';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = backgroundColor;
                                    }}
                                >
                                    {t('affiliate.maybeLater')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Affiliate Status Banner */}
                {(isAffiliate && affiliateStatus === 'pending') && (
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6 border-2" style={{ borderColor: warningColor, backgroundColor: warningColor + '20' }}>
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: warningColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                                    <h3 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                                        Registration Under Review
                                    </h3>
                                    <button
                                        onClick={async () => {
                                            const result = await Swal.fire({
                                                title: 'Are you sure?',
                                                text: 'You want to cancel your affiliate registration request? This action cannot be undone.',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#ef4444',
                                                cancelButtonColor: '#6b7280',
                                                confirmButtonText: 'Cancel Registration',
                                                cancelButtonText: 'Keep It',
                                            });

                                            if (!result.isConfirmed) {
                                                return;
                                            }

                                            setCancelLoading(true);
                                            try {
                                                const result = await dispatch(cancelAffiliateRegistration());
                                                if (cancelAffiliateRegistration.fulfilled.match(result)) {
                                                    showSuccess('Affiliate registration cancelled successfully!');
                                                    // Affiliate check disabled - no need to refresh
                                                    // dispatch(fetchAffiliateProfile());
                                                } else {
                                                    showError(`Failed to cancel: ${result.payload || 'Unknown error'}`);
                                                }
                                            } catch (error) {
                                                showError(`Error: ${error.message || 'Failed to cancel registration'}`);
                                            } finally {
                                                setCancelLoading(false);
                                            }
                                        }}
                                        disabled={cancelLoading}
                                        className="btn btn-sm px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        style={{ backgroundColor: errorColor, minHeight: '36px' }}
                                        onMouseEnter={(e) => {
                                            if (!e.target.disabled) {
                                                e.target.style.backgroundColor = errorColor.startsWith('#') ? `color-mix(in srgb, ${errorColor} 80%, black)` : `darken(${errorColor}, 10%)`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!e.target.disabled) {
                                                e.target.style.backgroundColor = errorColor;
                                            }
                                        }}
                                    >
                                        {cancelLoading ? (
                                            <>
                                                <span className="loading loading-spinner loading-xs"></span>
                                                <span className="ml-1">Cancelling...</span>
                                            </>
                                        ) : (
                                            'Cancel Request'
                                        )}
                                    </button>
                                </div>
                                <p className="text-sm sm:text-base mb-2" style={{ color: secondaryTextColor }}>
                                    Your affiliate registration is pending admin approval. You'll receive your referral link once approved.
                                </p>
                                {affiliate?.referralCode && (
                                    <p className="text-xs sm:text-sm font-mono font-medium" style={{ color: buttonColor }}>
                                        Your Referral Code: {affiliate.referralCode}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Affiliate Success Banner */}
                {(isAffiliate && affiliateStatus === 'active') && (
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6 border-2" style={{ borderColor: successColor, backgroundColor: successColor + '20' }}>
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: successColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: primaryTextColor }}>
                                    {t('affiliate.accountApprovedTitle')}
                                </h3>
                                <p className="text-sm sm:text-base mb-3" style={{ color: secondaryTextColor }}>
                                    {t('affiliate.accountApprovedMessage')}
                                </p>
                                {activeCouponCode && (
                                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor }}>
                                        <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: secondaryTextColor }}>
                                            Active Coupon Code:
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                            <code className="text-xs sm:text-sm font-mono p-2 rounded flex-1 break-all text-center font-bold" style={{ backgroundColor: secondaryTextColor + '20', color: successColor, fontSize: '1.1rem', letterSpacing: '2px' }}>
                                                {activeCouponCode}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(activeCouponCode);
                                                    showSuccess('Coupon code copied to clipboard!');
                                                }}
                                                className="btn btn-sm px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white whitespace-nowrap"
                                                style={{ backgroundColor: successColor, minHeight: '36px' }}
                                            >
                                                Copy Code
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {loadingCoupon && (
                                    <div className="mt-3 p-3 rounded-lg flex items-center justify-center" style={{ backgroundColor }}>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        <span className="ml-2 text-xs sm:text-sm" style={{ color: secondaryTextColor }}>Loading coupon code...</span>
                                    </div>
                                )}
                                <div className="mt-4 pt-4 border-t" style={{ borderColor: secondaryTextColor }}>
                                    <p className="text-xs sm:text-sm font-medium mb-2" style={{ color: primaryTextColor }}>
                                        {t('affiliate.whatYouCanDo')}
                                    </p>
                                    <ul className="text-xs sm:text-sm space-y-1" style={{ color: secondaryTextColor }}>
                                        <li>• {t('affiliate.shareLinkFeature')}</li>
                                        <li>• {t('affiliate.trackCommissionsFeature')}</li>
                                        <li>• {t('affiliate.viewHistoryFeature')}</li>
                                        <li>• {t('affiliate.requestWithdrawFeature')}</li>
                                        <li>• {t('affiliate.monitorPerformanceFeature')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* Rejected Affiliate Status Banner */}
                {isAffiliate && affiliateStatus === 'rejected' && (
                    <div className="bg-red-50 rounded-lg shadow-sm p-4 sm:p-6 mb-6 border-2" style={{ borderColor: '#EF4444' }}>
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#EF4444' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: primaryTextColor }}>
                                    {t('affiliate.registrationRejected')}
                                </h3>
                                <p className="text-sm sm:text-base mb-3" style={{ color: secondaryTextColor }}>
                                    {t('affiliate.registrationRejectedDescription')}
                                </p>
                                <button
                                    onClick={() => setShowRegistrationModal(true)}
                                    className="btn px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md"
                                    style={{ backgroundColor: buttonColor, minHeight: '44px' }}
                                    onMouseEnter={(e) => {
                                        const isDark = buttonColor === '#6B8E6B';
                                        e.target.style.backgroundColor = isDark ? '#5a7a5a' : '#0f172a';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = buttonColor;
                                    }}
                                >
                                    {t('affiliate.reRegister')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Total Orders */}
                    <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                    {t('user.totalOrders') || 'Total Orders'}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                    {totalOrders}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryTextColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                    {t('user.totalSpent') || 'Total Spent'}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                    {formatCurrency(totalSpent)}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryTextColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* eBooks Owned */}
                    <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border sm:col-span-2 lg:col-span-1" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                    {t('user.ebooksOwned') || 'eBooks Owned'}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                    {totalEBooks}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryTextColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Affiliate Statistics Cards - Only show if affiliate */}
                    {isAffiliate && affiliateStatus === 'active' && affiliateStats && (
                        <>
                            {/* Total Commission */}
                            <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                            Total Commission
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: buttonColor }}>
                                            {formatCurrency(affiliateStats.affiliate?.totalCommission || 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: buttonColor + '30' }}>
                                        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: buttonColor }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Pending Commission */}
                            <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                            Pending Commission
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#F59E0B' }}>
                                            {formatCurrency(affiliateStats.affiliate?.pendingCommission || 0)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F59E0B30' }}>
                                        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#F59E0B' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Total Referrals */}
                            <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                            Total Referrals
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                            {affiliateStats.affiliate?.totalReferrals || 0}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: primaryTextColor }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile Section */}
                <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                            {t('user.myInfo') || 'My Info'}
                        </h2>
                        <Link
                            to="/dashboard/profile"
                            className="text-sm font-medium hover:underline"
                            style={{ color: primaryTextColor }}
                        >
                            {t('user.editProfile') || 'Edit Profile'}
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* User Info */}
                        <div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs mb-1" style={{ color: secondaryTextColor }}>
                                        {t('user.userName') || 'User Name'}
                                    </p>
                                    <p className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                        {(() => {
                                            const userName = profile?.profile?.name || profile?.name || user?.profile?.name || '';
                                            return userName || '-';
                                        })()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs mb-1" style={{ color: secondaryTextColor }}>
                                        {t('user.userEmail') || 'User Email'}
                                    </p>
                                    <p className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                        {profile?.profile?.email || profile?.email || user?.profile?.email || user?.email || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs mb-1" style={{ color: secondaryTextColor }}>
                                        {t('user.mobile') || 'Mobile'}
                                    </p>
                                    <p className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                        {user?.mobile || profile?.mobile || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Address Info */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                                {t('user.address') || 'Address'}
                            </h3>
                            {addresses && addresses.length > 0 ? (
                                (() => {
                                    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
                                    return (
                                        <div className="space-y-2">
                                            {defaultAddress.isDefault && (
                                                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mb-2" style={{ backgroundColor: buttonColor + '30', color: buttonColor }}>
                                                    {t('user.defaultAddress') || 'Default Address'}
                                                </span>
                                            )}
                                            <div className="text-sm" style={{ color: primaryTextColor }}>
                                                {defaultAddress.recipientName && (
                                                    <p className="font-medium mb-1">{defaultAddress.recipientName}</p>
                                                )}
                                                {defaultAddress.addressLine1 && (
                                                    <p className="mb-1">{defaultAddress.addressLine1}</p>
                                                )}
                                                {defaultAddress.addressLine2 && (
                                                    <p className="mb-1">{defaultAddress.addressLine2}</p>
                                                )}
                                                <p className="mb-1">
                                                    {[
                                                        defaultAddress.area,
                                                        defaultAddress.city,
                                                        defaultAddress.district,
                                                        defaultAddress.postalCode
                                                    ].filter(Boolean).join(', ')}
                                                </p>
                                                {defaultAddress.recipientMobile && (
                                                    <p className="text-xs mt-2" style={{ color: secondaryTextColor }}>
                                                        {t('user.recipientMobileLabel') || 'Mobile'}: {defaultAddress.recipientMobile}
                                                    </p>
                                                )}
                                            </div>
                                            <Link
                                                to="/dashboard/addresses"
                                                className="inline-block text-xs font-medium hover:underline mt-2"
                                                style={{ color: primaryTextColor }}
                                            >
                                                {t('user.viewAllAddress') || 'View All Address'} →
                                            </Link>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div>
                                    <p className="text-sm mb-3" style={{ color: secondaryTextColor }}>
                                        {t('user.noAddress') || 'No address added yet'}
                                    </p>
                                    <Link
                                        to="/dashboard/addresses"
                                        className="inline-block px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                                        style={{
                                            backgroundColor: buttonColor,
                                            color: '#ffffff'
                                        }}
                                        onMouseEnter={(e) => {
                                            const isDark = buttonColor === '#6B8E6B';
                                            e.target.style.backgroundColor = isDark ? '#5a7a5a' : '#0f172a';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = buttonColor;
                                        }}
                                    >
                                        {t('user.addAddress') || 'Add Address'}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: primaryTextColor }}>
                        {t('user.quickActions') || 'Quick Actions'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <Link
                            to="/dashboard/profile"
                            className="group flex flex-col items-center justify-center h-20 sm:h-24 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                            style={{
                                borderColor: buttonColor,
                                color: primaryTextColor,
                                backgroundColor: backgroundColor
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = buttonColor;
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = backgroundColor;
                                e.currentTarget.style.color = primaryTextColor;
                            }}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium">{t('user.profile') || 'Profile'}</span>
                        </Link>
                        <Link
                            to="/dashboard/orders"
                            className="group flex flex-col items-center justify-center h-20 sm:h-24 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                            style={{
                                borderColor: buttonColor,
                                color: primaryTextColor,
                                backgroundColor: backgroundColor
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = buttonColor;
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = backgroundColor;
                                e.currentTarget.style.color = primaryTextColor;
                            }}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium">{t('orders.title') || 'Orders'}</span>
                        </Link>
                        <Link
                            to="/dashboard/addresses"
                            className="group flex flex-col items-center justify-center h-20 sm:h-24 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                            style={{
                                borderColor: buttonColor,
                                color: primaryTextColor,
                                backgroundColor: backgroundColor
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = buttonColor;
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = backgroundColor;
                                e.currentTarget.style.color = primaryTextColor;
                            }}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium">{t('user.addresses') || 'Addresses'}</span>
                        </Link>
                        <Link
                            to="/dashboard/ebooks"
                            className="group flex flex-col items-center justify-center h-20 sm:h-24 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                            style={{
                                borderColor: buttonColor,
                                color: primaryTextColor,
                                backgroundColor: backgroundColor
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = buttonColor;
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = backgroundColor;
                                e.currentTarget.style.color = primaryTextColor;
                            }}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium">{t('user.ebooks') || 'eBooks'}</span>
                        </Link>

                        {/* Affiliate Quick Actions - Only show if affiliate is active */}
                        {isAffiliate && affiliateStatus === 'active' && (
                            <>
                                <Link
                                    to="/dashboard/affiliate"
                                    className="group flex flex-col items-center justify-center h-20 sm:h-24 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                                    style={{
                                        borderColor: buttonColor,
                                        color: buttonColor,
                                        backgroundColor: buttonColor + '20'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = buttonColor;
                                        e.currentTarget.style.color = '#ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = buttonColor + '20';
                                        e.currentTarget.style.color = buttonColor;
                                    }}
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="text-xs sm:text-sm font-medium">Affiliate Dashboard</span>
                                </Link>
                                <Link
                                    to="/dashboard/affiliate/withdraw"
                                    className="group flex flex-col items-center justify-center h-20 sm:h-24 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                                    style={{
                                        borderColor: buttonColor,
                                        color: buttonColor,
                                        backgroundColor: buttonColor + '20'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = buttonColor;
                                        e.currentTarget.style.color = '#ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = buttonColor + '20';
                                        e.currentTarget.style.color = buttonColor;
                                    }}
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-xs sm:text-sm font-medium">Withdraw</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                            {t('user.recentOrders') || 'Recent Orders'}
                        </h2>
                        <Link
                            to="/dashboard/orders"
                            className="text-sm font-medium hover:underline"
                            style={{ color: primaryTextColor }}
                        >
                            View All
                        </Link>
                    </div>

                    {ordersLoading ? (
                        <div className="flex justify-center py-8">
                            <Loading />
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm sm:text-base opacity-70 mb-4" style={{ color: secondaryTextColor }}>
                                {t('user.noOrdersYet') || 'No orders yet'}
                            </p>
                            <Link
                                to="/products"
                                className="btn btn-primary text-white"
                                style={{ backgroundColor: buttonColor }}
                            >
                                {t('user.startShopping') || 'Start Shopping'}
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr style={{ backgroundColor: buttonColor }}>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Order Id</th>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('orders.orderDate') || 'Order Date'}</th>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Status</th>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('orders.total') || 'Total'}</th>
                                        <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('common.view') || 'View'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order._id} className="border-b hover:bg-base-200 transition-colors" style={{ borderColor: secondaryTextColor }}>
                                            <td className="py-3 px-4">
                                                <span className="text-xs sm:text-sm font-mono font-medium" style={{ color: primaryTextColor }}>{order.orderId}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>{formatDate(order.createdAt)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`badge badge-sm ${order.orderStatus === 'delivered' ? 'badge-success' :
                                                    order.orderStatus === 'cancelled' ? 'badge-error' :
                                                        'badge-warning'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs sm:text-sm font-semibold" style={{ color: primaryTextColor }}>{formatCurrency(order.total)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    to={`/orders/${order._id}`}
                                                    className="inline-block px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-sm"
                                                    style={{
                                                        backgroundColor: buttonColor,
                                                        color: '#ffffff',
                                                        border: 'none'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        const isDark = buttonColor === '#6B8E6B';
                                                        e.target.style.backgroundColor = isDark ? '#5a7a5a' : '#0f172a';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = buttonColor;
                                                    }}
                                                >
                                                    {t('common.view') || 'View'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Recent eBooks with Embedded Viewer */}
                {eBooks.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border mt-6 sm:mt-8" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#1E293B' }}>
                                {t('user.recentEBooks') || 'Recent eBooks'}
                            </h2>
                            <Link
                                to="/dashboard/ebooks"
                                className="text-sm font-medium hover:underline"
                                style={{ color: '#1E293B' }}
                            >
                                View All
                            </Link>
                        </div>

                        {/* eBooks Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                            {eBooks.slice(0, 5).map((eBook) => {
                                const productId = eBook.product?.id || eBook.product?._id;
                                return (
                                    <button
                                        key={eBook.id || productId}
                                        onClick={() => {
                                            setSelectedEBook(eBook);
                                            setShowViewer(true);
                                            // Fetch access token for this eBook
                                            if (productId) {
                                                dispatch(fetcheBookAccess(productId));
                                            }
                                        }}
                                        className="card bg-base-100 shadow-sm hover:shadow-md transition-all border-2 hover:border-primary cursor-pointer"
                                        style={{ borderColor: '#e2e8f0' }}
                                    >
                                        <figure className="aspect-[3/4] overflow-hidden bg-base-200">
                                            <img
                                                src={eBook.product?.thumbnail || eBook.product?.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5lQm9vazwvdGV4dD48L3N2Zz4='}
                                                alt={eBook.product?.title || eBook.product?.name || 'eBook'}
                                                className="w-full h-full object-cover"
                                            />
                                        </figure>
                                        <div className="card-body p-2 sm:p-3">
                                            <h3 className="card-title text-xs sm:text-sm font-semibold line-clamp-2" style={{ color: '#1E293B' }}>
                                                {eBook.product?.title || eBook.product?.name || 'eBook'}
                                            </h3>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Embedded PDF Viewer Modal */}
                        {showViewer && selectedEBook && <EmbeddedViewerModal eBook={selectedEBook} onClose={() => {
                            setShowViewer(false);
                            setSelectedEBook(null);
                        }} />}
                    </div>
                )}

                {/* Affiliate Registration Modal */}
                {showRegistrationModal && (
                    <AffiliateRegistrationModal
                        onClose={() => {
                            setShowRegistrationModal(false);
                            // Affiliate check disabled - no need to refresh
                        }}
                        onSuccess={() => {
                            setShowRegistrationModal(false);
                            // Affiliate check disabled - no need to refresh
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// Embedded Viewer Modal Component
function EmbeddedViewerModal({ eBook, onClose }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const accessToken = useSelector(selectAccessToken);
    const [pdfURL, setPdfURL] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const productId = eBook.product?.id || eBook.product?._id;
        if (productId) {
            dispatch(fetcheBookAccess(productId));
        }
    }, [dispatch, eBook]);

    useEffect(() => {
        if (accessToken) {
            setPdfURL(getPDFURL(accessToken));
            setLoading(false);
        }
    }, [accessToken]);

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-7xl w-full h-[90vh] p-0 flex flex-col" style={{ backgroundColor }}>
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: secondaryTextColor }}>
                    <h3 className="text-lg font-bold" style={{ color: primaryTextColor }}>
                        {eBook.product?.title || eBook.product?.name || 'Reading eBook'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                        style={{ color: primaryTextColor }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                    {loading || !pdfURL ? (
                        <div className="flex items-center justify-center h-full">
                            <Loading />
                        </div>
                    ) : (
                        <SecurePDFViewer pdfURL={pdfURL} accessToken={accessToken} />
                    )}
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}

export default Dashboard;

