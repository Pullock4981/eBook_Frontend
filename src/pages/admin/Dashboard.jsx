/**
 * Admin Dashboard Page
 * 
 * Main dashboard for admin with statistics, charts, and quick actions
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchDashboardStats, selectDashboard, selectDashboardLoading, selectDashboardError, selectDashboardOverview, selectDashboardOrders, selectDashboardRevenue, selectDashboardProducts, selectDashboardAffiliates } from '../../store/slices/adminSlice';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { fetchUserProfile, selectUserProfile } from '../../store/slices/userSlice';
import { getAllAffiliates } from '../../services/adminAffiliateService';
import Loading from '../../components/common/Loading';
import { formatCurrency, formatDate } from '../../utils/helpers';
import UserAnalyticsChart from '../../components/admin/UserAnalyticsChart';
import ProductAnalyticsChart from '../../components/admin/ProductAnalyticsChart';
import PaymentAnalyticsChart from '../../components/admin/PaymentAnalyticsChart';
import { useThemeColors } from '../../hooks/useThemeColors';

function AdminDashboard() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, warningColor, successColor, errorColor, infoColor } = useThemeColors();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const profile = useSelector(selectUserProfile);
    const dashboard = useSelector(selectDashboard);
    const overview = useSelector(selectDashboardOverview);
    const orders = useSelector(selectDashboardOrders);
    const revenue = useSelector(selectDashboardRevenue);
    const products = useSelector(selectDashboardProducts);
    const affiliates = useSelector(selectDashboardAffiliates);
    const isLoading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);
    const [pendingAffiliates, setPendingAffiliates] = useState([]);
    const [loadingPendingAffiliates, setLoadingPendingAffiliates] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchDashboardStats());
        dispatch(fetchUserProfile());

        // Fetch pending affiliates for alerts
        fetchPendingAffiliates();
    }, [dispatch, isAuthenticated, navigate]);

    const fetchPendingAffiliates = async () => {
        try {
            setLoadingPendingAffiliates(true);
            const response = await getAllAffiliates({ status: 'pending' }, 1, 5);
            if (response?.success && response?.data?.affiliates) {
                setPendingAffiliates(response.data.affiliates);
            }
        } catch (error) {
            console.error('Error fetching pending affiliates:', error);
        } finally {
            setLoadingPendingAffiliates(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: t('orders.status.pending') || 'Pending', bg: '#fef3c7', color: '#92400e' },
            confirmed: { label: t('orders.status.confirmed') || 'Confirmed', bg: '#6B8E6B', color: '#ffffff' },
            processing: { label: t('orders.status.processing') || 'Processing', bg: '#6B8E6B', color: '#ffffff' },
            shipped: { label: t('orders.status.shipped') || 'Shipped', bg: '#6B8E6B', color: '#ffffff' },
            delivered: { label: t('orders.status.delivered') || 'Delivered', bg: '#d1fae5', color: '#065f46' },
            cancelled: { label: t('orders.status.cancelled') || 'Cancelled', bg: '#fee2e2', color: '#991b1b' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: config.bg, color: config.color }}>
                {config.label}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: t('orders.paymentStatus.pending') || 'Pending', bg: '#fef3c7', color: '#92400e' },
            paid: { label: t('orders.paymentStatus.paid') || 'Paid', bg: '#d1fae5', color: '#065f46' },
            failed: { label: t('orders.paymentStatus.failed') || 'Failed', bg: '#fee2e2', color: '#991b1b' },
            refunded: { label: t('orders.paymentStatus.refunded') || 'Refunded', bg: '#f3f4f6', color: '#374151' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: config.bg, color: config.color }}>
                {config.label}
            </span>
        );
    };

    if (isLoading && !overview) {
        return (
            <div style={{ backgroundColor }}>
                <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                    <Loading />
                </div>
            </div>
        );
    }

    if (error && !overview) {
        return (
            <div style={{ backgroundColor }}>
                <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                    <div className="bg-base-100 rounded-lg shadow-sm p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <p style={{ color: errorColor || '#ef4444' }}>{error}</p>
                        <button
                            onClick={() => dispatch(fetchDashboardStats())}
                            className="btn btn-primary text-white mt-4"
                            style={{ backgroundColor: buttonColor }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-1.5" style={{ color: primaryTextColor }}>
                        {t('admin.dashboard.title') || 'Admin Dashboard'}
                    </h1>
                    <p className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                        {(() => {
                            const userName = profile?.profile?.name || profile?.name || user?.profile?.name || '';
                            return userName || (t('nav.admin') || 'Admin');
                        })()}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: primaryTextColor }}>
                        {t('admin.dashboard.quickActions') || 'Quick Actions'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link
                            to="/admin/products/create"
                            className="group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
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
                            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-center">
                                {t('admin.dashboard.addProduct') || 'Add Product'}
                            </span>
                        </Link>

                        <Link
                            to="/admin/categories"
                            className="group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
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
                            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-center">
                                {t('admin.dashboard.addCategory') || 'Add Category'}
                            </span>
                        </Link>

                        <Link
                            to="/admin/coupons/create"
                            className="group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
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
                            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-center">
                                {t('admin.dashboard.createCoupon') || 'Create Coupon'}
                            </span>
                        </Link>

                        <Link
                            to="/admin/users"
                            className="group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
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
                            <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-medium text-center">
                                {t('admin.dashboard.viewUsers') || 'View Users'}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Alerts/Notifications Section */}
                {(pendingAffiliates.length > 0 || (orders?.byStatus && orders.byStatus.pending > 0)) && (
                    <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border-2" style={{ borderColor: warningColor || '#F59E0B', backgroundColor: warningColor ? warningColor + '20' : '#fef3c7' }}>
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: warningColor || '#F59E0B' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold mb-3" style={{ color: primaryTextColor }}>
                                    {t('admin.dashboard.alerts') || 'Alerts & Notifications'}
                                </h3>
                                <div className="space-y-2">
                                    {pendingAffiliates.length > 0 && (
                                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor }}>
                                            <div className="flex items-center gap-2">
                                                <span className="badge badge-warning badge-sm">{pendingAffiliates.length}</span>
                                                <span className="text-sm sm:text-base" style={{ color: primaryTextColor }}>
                                                    {t('admin.dashboard.pendingAffiliateRequests') || 'Pending Affiliate Requests'}
                                                </span>
                                            </div>
                                            <Link
                                                to="/admin/affiliates?status=pending"
                                                className="btn btn-sm px-3 py-1.5 text-xs sm:text-sm font-medium text-white"
                                                style={{ backgroundColor: buttonColor, minHeight: '32px' }}
                                            >
                                                {t('admin.dashboard.review') || 'Review'}
                                            </Link>
                                        </div>
                                    )}
                                    {orders?.byStatus?.pending > 0 && (
                                        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor }}>
                                            <div className="flex items-center gap-2">
                                                <span className="badge badge-warning badge-sm">{orders.byStatus.pending}</span>
                                                <span className="text-sm sm:text-base" style={{ color: primaryTextColor }}>
                                                    {t('admin.dashboard.pendingOrders') || 'Pending Orders'}
                                                </span>
                                            </div>
                                            <Link
                                                to="/admin/orders?status=pending"
                                                className="btn btn-sm px-3 py-1.5 text-xs sm:text-sm font-medium text-white"
                                                style={{ backgroundColor: buttonColor, minHeight: '32px' }}
                                            >
                                                {t('admin.dashboard.view') || 'View'}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                {overview && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Total Users */}
                        <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                                    {t('admin.dashboard.totalUsers') || 'Total Users'}
                                </h3>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                    <svg className="w-5 h-5" style={{ color: secondaryTextColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                {overview.totalUsers || 0}
                            </p>
                        </div>

                        {/* Total Products */}
                        <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                                    {t('admin.dashboard.totalProducts') || 'Total Products'}
                                </h3>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                    <svg className="w-5 h-5" style={{ color: secondaryTextColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                {overview.totalProducts || 0}
                            </p>
                        </div>

                        {/* Total Orders */}
                        <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                                    {t('admin.dashboard.totalOrders') || 'Total Orders'}
                                </h3>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: successColor ? successColor + '20' : '#d1fae5' }}>
                                    <svg className="w-5 h-5" style={{ color: successColor || '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                {overview.totalOrders || 0}
                            </p>
                        </div>

                        {/* Total Revenue */}
                        <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                                    {t('admin.dashboard.totalRevenue') || 'Total Revenue'}
                                </h3>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: warningColor ? warningColor + '20' : '#fef3c7' }}>
                                    <svg className="w-5 h-5" style={{ color: warningColor || '#92400e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                {formatCurrency(overview.totalRevenue || 0)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Additional Statistics Row */}
                {overview && (overview.pendingAffiliates > 0 || overview.activeAffiliates > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Pending Affiliates */}
                        {overview.pendingAffiliates > 0 && (
                            <div className="rounded-lg shadow-sm p-4 sm:p-6 border-2" style={{ borderColor: warningColor || '#F59E0B', backgroundColor: warningColor ? warningColor + '20' : '#fef3c7' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                        {t('admin.dashboard.pendingAffiliates') || 'Pending Affiliates'}
                                    </h3>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: warningColor ? warningColor + '40' : '#fef3c7' }}>
                                        <svg className="w-5 h-5" style={{ color: warningColor || '#92400e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                    {overview.pendingAffiliates || 0}
                                </p>
                                <Link
                                    to="/admin/affiliates?status=pending"
                                    className="text-xs sm:text-sm mt-2 inline-block hover:underline"
                                    style={{ color: buttonColor }}
                                >
                                    {t('admin.dashboard.reviewAll') || 'Review All →'}
                                </Link>
                            </div>
                        )}

                        {/* Active Affiliates */}
                        {overview.activeAffiliates > 0 && (
                            <div className="rounded-lg shadow-sm p-4 sm:p-6 border-2" style={{ borderColor: successColor || '#6B8E6B', backgroundColor: successColor ? successColor + '20' : '#d1fae5' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                        {t('admin.dashboard.activeAffiliates') || 'Active Affiliates'}
                                    </h3>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: successColor ? successColor + '40' : '#d1fae5' }}>
                                        <svg className="w-5 h-5" style={{ color: successColor || '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryTextColor }}>
                                    {overview.activeAffiliates || 0}
                                </p>
                                <Link
                                    to="/admin/affiliates?status=active"
                                    className="text-xs sm:text-sm mt-2 inline-block hover:underline"
                                    style={{ color: buttonColor }}
                                >
                                    {t('admin.dashboard.viewAll') || 'View All →'}
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Analytics Charts Section */}
                <div className="space-y-6 sm:space-8 mb-6 sm:mb-8">
                    {/* User Analytics Chart */}
                    <UserAnalyticsChart overview={overview} />

                    {/* Product Analytics Chart */}
                    <ProductAnalyticsChart products={products} overview={overview} />

                    {/* Payment & Revenue Analytics Chart */}
                    <PaymentAnalyticsChart revenue={revenue} orders={orders} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    {/* Recent Orders */}
                    <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                                {t('admin.dashboard.recentOrders') || 'Recent Orders'}
                            </h2>
                            <Link
                                to="/admin/orders"
                                className="text-sm font-medium hover:underline"
                                style={{ color: buttonColor }}
                            >
                                View All →
                            </Link>
                        </div>
                        {orders && orders.recent && orders.recent.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: buttonColor }}>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold" style={{ color: '#ffffff' }}>
                                                {t('admin.dashboard.orderId') || 'Order ID'}
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold" style={{ color: '#ffffff' }}>
                                                {t('admin.dashboard.date') || 'Date'}
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold" style={{ color: '#ffffff' }}>
                                                {t('admin.dashboard.status') || 'Status'}
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold" style={{ color: '#ffffff' }}>
                                                {t('admin.dashboard.amount') || 'Amount'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.recent.slice(0, 5).map((order) => (
                                            <tr key={order.id || order._id} className="border-b transition-colors" style={{ borderColor: secondaryTextColor }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <td className="py-3 px-4">
                                                    <span className="text-xs sm:text-sm font-medium" style={{ color: primaryTextColor }}>
                                                        {order.orderId || order.id || '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                        {formatDate(order.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getStatusBadge(order.status || order.orderStatus)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-xs sm:text-sm font-medium" style={{ color: primaryTextColor }}>
                                                        {formatCurrency(order.total || 0)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-center py-4" style={{ color: secondaryTextColor }}>
                                {t('admin.dashboard.noOrders') || 'No orders found'}
                            </p>
                        )}
                    </div>

                    {/* Top Products */}
                    <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                                {t('admin.dashboard.topProducts') || 'Top Products'}
                            </h2>
                            <Link
                                to="/admin/products"
                                className="text-sm font-medium hover:underline"
                                style={{ color: buttonColor }}
                            >
                                View All →
                            </Link>
                        </div>
                        {products && products.topSelling && products.topSelling.length > 0 ? (
                            <div className="space-y-3">
                                {products.topSelling.slice(0, 5).map((item, index) => (
                                    <div key={item.product?.id || index} className="flex items-center justify-between p-2 rounded-lg transition-colors"
                                        style={{ backgroundColor: 'transparent' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: buttonColor }}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: primaryTextColor }}>
                                                    {item.product?.name || 'Unknown Product'}
                                                </p>
                                                <p className="text-xs" style={{ color: secondaryTextColor }}>
                                                    {item.quantity || 0} {t('admin.dashboard.sold') || 'sold'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <p className="text-sm font-bold" style={{ color: primaryTextColor }}>
                                                {formatCurrency(item.revenue || 0)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-center py-4" style={{ color: secondaryTextColor }}>
                                {t('admin.dashboard.noProducts') || 'No products found'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

