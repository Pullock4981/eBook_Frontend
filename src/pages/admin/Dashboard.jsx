/**
 * Admin Dashboard Page
 * 
 * Main dashboard for admin with statistics, charts, and quick actions
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchDashboardStats, selectDashboard, selectDashboardLoading, selectDashboardError, selectDashboardOverview, selectDashboardOrders, selectDashboardRevenue, selectDashboardProducts } from '../../store/slices/adminSlice';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { fetchUserProfile, selectUserProfile } from '../../store/slices/userSlice';
import Loading from '../../components/common/Loading';
import { formatCurrency, formatDate } from '../../utils/helpers';

function AdminDashboard() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const profile = useSelector(selectUserProfile);
    const dashboard = useSelector(selectDashboard);
    const overview = useSelector(selectDashboardOverview);
    const orders = useSelector(selectDashboardOrders);
    const revenue = useSelector(selectDashboardRevenue);
    const products = useSelector(selectDashboardProducts);
    const isLoading = useSelector(selectDashboardLoading);
    const error = useSelector(selectDashboardError);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchDashboardStats());
        dispatch(fetchUserProfile());
    }, [dispatch, isAuthenticated, navigate]);

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
            <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
                <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                    <Loading />
                </div>
            </div>
        );
    }

    if (error && !overview) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
                <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border" style={{ borderColor: '#e2e8f0' }}>
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => dispatch(fetchDashboardStats())}
                            className="btn btn-primary text-white mt-4"
                            style={{ backgroundColor: '#1E293B' }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-1.5" style={{ color: '#1E293B' }}>
                        {t('admin.dashboard.title') || 'Admin Dashboard'}
                    </h1>
                    <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                        {(() => {
                            const userName = profile?.profile?.name || profile?.name || user?.profile?.name || '';
                            return userName || (t('nav.admin') || 'Admin');
                        })()}
                    </p>
                </div>

                {/* Statistics Cards */}
                {overview && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Total Users */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium" style={{ color: '#64748b' }}>
                                    {t('admin.dashboard.totalUsers') || 'Total Users'}
                                </h3>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                                    <svg className="w-5 h-5" style={{ color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>
                                {overview.totalUsers || 0}
                            </p>
                        </div>

                        {/* Total Products */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium" style={{ color: '#64748b' }}>
                                    {t('admin.dashboard.totalProducts') || 'Total Products'}
                                </h3>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                                    <svg className="w-5 h-5" style={{ color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>
                                {overview.totalProducts || 0}
                            </p>
                        </div>

                        {/* Total Orders */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium" style={{ color: '#64748b' }}>
                                    {t('admin.dashboard.totalOrders') || 'Total Orders'}
                                </h3>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
                                    <svg className="w-5 h-5" style={{ color: '#059669' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>
                                {overview.totalOrders || 0}
                            </p>
                        </div>

                        {/* Total Revenue */}
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium" style={{ color: '#64748b' }}>
                                    {t('admin.dashboard.totalRevenue') || 'Total Revenue'}
                                </h3>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                                    <svg className="w-5 h-5" style={{ color: '#92400e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>
                                {formatCurrency(overview.totalRevenue || 0)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Revenue by Period */}
                {revenue && revenue.byPeriod && (
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border" style={{ borderColor: '#e2e8f0' }}>
                        <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1E293B' }}>
                            {t('admin.dashboard.revenueByPeriod') || 'Revenue by Period'}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>
                                    {t('admin.dashboard.today') || 'Today'}
                                </p>
                                <p className="text-lg font-bold" style={{ color: '#1E293B' }}>
                                    {formatCurrency(revenue.byPeriod.today || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>
                                    {t('admin.dashboard.last7Days') || 'Last 7 Days'}
                                </p>
                                <p className="text-lg font-bold" style={{ color: '#1E293B' }}>
                                    {formatCurrency(revenue.byPeriod.last7Days || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>
                                    {t('admin.dashboard.last30Days') || 'Last 30 Days'}
                                </p>
                                <p className="text-lg font-bold" style={{ color: '#1E293B' }}>
                                    {formatCurrency(revenue.byPeriod.last30Days || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>
                                    {t('admin.dashboard.last90Days') || 'Last 90 Days'}
                                </p>
                                <p className="text-lg font-bold" style={{ color: '#1E293B' }}>
                                    {formatCurrency(revenue.byPeriod.last90Days || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border" style={{ borderColor: '#e2e8f0' }}>
                    <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1E293B' }}>
                        {t('admin.dashboard.quickActions') || 'Quick Actions'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link
                            to="/admin/products/create"
                            className="group flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                            style={{
                                borderColor: '#1E293B',
                                color: '#1E293B',
                                backgroundColor: '#f8fafc'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1E293B';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#1E293B';
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
                                borderColor: '#1E293B',
                                color: '#1E293B',
                                backgroundColor: '#f8fafc'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1E293B';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#1E293B';
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
                                borderColor: '#1E293B',
                                color: '#1E293B',
                                backgroundColor: '#f8fafc'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1E293B';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#1E293B';
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
                                borderColor: '#1E293B',
                                color: '#1E293B',
                                backgroundColor: '#f8fafc'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#1E293B';
                                e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.color = '#1E293B';
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#1E293B' }}>
                                {t('admin.dashboard.recentOrders') || 'Recent Orders'}
                            </h2>
                            <Link
                                to="/admin/orders"
                                className="text-sm font-medium hover:underline"
                                style={{ color: '#1E293B' }}
                            >
                                View All →
                            </Link>
                        </div>
                        {orders && orders.recent && orders.recent.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: '#6B8E6B' }}>
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
                                            <tr key={order.id || order._id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: '#e2e8f0' }}>
                                                <td className="py-3 px-4">
                                                    <span className="text-xs sm:text-sm font-medium" style={{ color: '#1E293B' }}>
                                                        {order.orderId || order.id || '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-xs sm:text-sm" style={{ color: '#64748b' }}>
                                                        {formatDate(order.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getStatusBadge(order.status || order.orderStatus)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-xs sm:text-sm font-medium" style={{ color: '#1E293B' }}>
                                                        {formatCurrency(order.total || 0)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-center py-4" style={{ color: '#64748b' }}>
                                {t('admin.dashboard.noOrders') || 'No orders found'}
                            </p>
                        )}
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#1E293B' }}>
                                {t('admin.dashboard.topProducts') || 'Top Products'}
                            </h2>
                            <Link
                                to="/admin/products"
                                className="text-sm font-medium hover:underline"
                                style={{ color: '#1E293B' }}
                            >
                                View All →
                            </Link>
                        </div>
                        {products && products.topSelling && products.topSelling.length > 0 ? (
                            <div className="space-y-3">
                                {products.topSelling.slice(0, 5).map((item, index) => (
                                    <div key={item.product?.id || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: '#1E293B' }}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: '#1E293B' }}>
                                                    {item.product?.name || 'Unknown Product'}
                                                </p>
                                                <p className="text-xs" style={{ color: '#64748b' }}>
                                                    {item.quantity || 0} {t('admin.dashboard.sold') || 'sold'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <p className="text-sm font-bold" style={{ color: '#1E293B' }}>
                                                {formatCurrency(item.revenue || 0)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-center py-4" style={{ color: '#64748b' }}>
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

