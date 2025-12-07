/**
 * User Dashboard Page
 * 
 * Main dashboard for authenticated users
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { fetchUserProfile, selectUserProfile } from '../../store/slices/userSlice';
import { fetchUserOrders, selectOrders, selectOrdersLoading } from '../../store/slices/orderSlice';
import Loading from '../../components/common/Loading';
import { formatCurrency, formatDate } from '../../utils/helpers';

function Dashboard() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const profile = useSelector(selectUserProfile);
    const orders = useSelector(selectOrders);
    const ordersLoading = useSelector(selectOrdersLoading);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchUserProfile());
        dispatch(fetchUserOrders({ page: 1, limit: 5 })); // Get recent 5 orders
    }, [dispatch, isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    const recentOrders = orders.slice(0, 5);
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Welcome Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('user.welcome') || 'Welcome'}, {user?.name || user?.mobile || 'User'}!
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                        {t('user.dashboardDescription') || 'Manage your account, orders, and eBooks'}
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {/* Total Orders */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: '#2d3748' }}>
                                    {t('user.totalOrders') || 'Total Orders'}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>
                                    {totalOrders}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1E293B' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: '#2d3748' }}>
                                    {t('user.totalSpent') || 'Total Spent'}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>
                                    {formatCurrency(totalSpent)}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1E293B' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* eBooks Owned */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border sm:col-span-2 lg:col-span-1" style={{ borderColor: '#e2e8f0' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm sm:text-base opacity-70 mb-1" style={{ color: '#2d3748' }}>
                                    {t('user.ebooksOwned') || 'eBooks Owned'}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>
                                    {t('user.comingSoon') || 'Coming Soon'}
                                </p>
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1E293B' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border" style={{ borderColor: '#e2e8f0' }}>
                    <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1E293B' }}>
                        {t('user.quickActions') || 'Quick Actions'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <Link
                            to="/dashboard/profile"
                            className="btn btn-outline flex flex-col items-center justify-center h-20 sm:h-24"
                            style={{ borderColor: '#1E293B', color: '#1E293B' }}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-xs sm:text-sm">{t('user.profile') || 'Profile'}</span>
                        </Link>
                        <Link
                            to="/dashboard/orders"
                            className="btn btn-outline flex flex-col items-center justify-center h-20 sm:h-24"
                            style={{ borderColor: '#1E293B', color: '#1E293B' }}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs sm:text-sm">{t('orders.title') || 'Orders'}</span>
                        </Link>
                        <Link
                            to="/dashboard/addresses"
                            className="btn btn-outline flex flex-col items-center justify-center h-20 sm:h-24"
                            style={{ borderColor: '#1E293B', color: '#1E293B' }}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm">{t('user.addresses') || 'Addresses'}</span>
                        </Link>
                        <Link
                            to="/dashboard/ebooks"
                            className="btn btn-outline flex flex-col items-center justify-center h-20 sm:h-24"
                            style={{ borderColor: '#1E293B', color: '#1E293B' }}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="text-xs sm:text-sm">{t('user.ebooks') || 'eBooks'}</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: '#e2e8f0' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold" style={{ color: '#1E293B' }}>
                            {t('user.recentOrders') || 'Recent Orders'}
                        </h2>
                        <Link
                            to="/dashboard/orders"
                            className="btn btn-sm btn-link text-sm"
                            style={{ color: '#1E293B' }}
                        >
                            {t('common.viewAll') || 'View All'}
                        </Link>
                    </div>

                    {ordersLoading ? (
                        <div className="flex justify-center py-8">
                            <Loading />
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm sm:text-base opacity-70 mb-4" style={{ color: '#2d3748' }}>
                                {t('user.noOrdersYet') || 'No orders yet'}
                            </p>
                            <Link
                                to="/products"
                                className="btn btn-primary text-white"
                                style={{ backgroundColor: '#1E293B' }}
                            >
                                {t('user.startShopping') || 'Start Shopping'}
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr>
                                        <th className="text-sm sm:text-base" style={{ color: '#1E293B' }}>{t('orders.orderId') || 'Order ID'}</th>
                                        <th className="text-sm sm:text-base" style={{ color: '#1E293B' }}>{t('orders.orderDate') || 'Date'}</th>
                                        <th className="text-sm sm:text-base" style={{ color: '#1E293B' }}>{t('orders.status') || 'Status'}</th>
                                        <th className="text-sm sm:text-base" style={{ color: '#1E293B' }}>{t('orders.total') || 'Total'}</th>
                                        <th className="text-sm sm:text-base" style={{ color: '#1E293B' }}>{t('common.view') || 'View'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order._id}>
                                            <td className="text-sm sm:text-base font-mono">{order.orderId}</td>
                                            <td className="text-sm sm:text-base">{formatDate(order.createdAt)}</td>
                                            <td>
                                                <span className={`badge badge-sm ${order.orderStatus === 'delivered' ? 'badge-success' :
                                                    order.orderStatus === 'cancelled' ? 'badge-error' :
                                                        'badge-warning'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="text-sm sm:text-base font-semibold">{formatCurrency(order.total)}</td>
                                            <td>
                                                <Link
                                                    to={`/orders/${order._id}`}
                                                    className="btn btn-sm btn-link"
                                                    style={{ color: '#1E293B' }}
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
            </div>
        </div>
    );
}

export default Dashboard;

