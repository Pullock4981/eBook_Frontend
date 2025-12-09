/**
 * Admin Orders List Page
 * 
 * Admin can view all orders, update payment status, and manage orders
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllOrders, adminUpdatePaymentStatus, adminUpdateOrderStatus, selectOrders, selectOrdersLoading, selectOrdersError, selectOrdersPagination } from '../../../store/slices/orderSlice';
import { selectIsAuthenticated } from '../../../store/slices/authSlice';
import Loading from '../../../components/common/Loading';
import Pagination from '../../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { useThemeColors } from '../../../hooks/useThemeColors';

function AdminOrderList() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const orders = useSelector(selectOrders);
    const isLoading = useSelector(selectOrdersLoading);
    const error = useSelector(selectOrdersError);
    const pagination = useSelector(selectOrdersPagination);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('paid');
    const [orderStatus, setOrderStatus] = useState('confirmed');
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchAllOrders({ page: pagination.currentPage, limit: pagination.itemsPerPage }));
    }, [dispatch, isAuthenticated, navigate]);

    const handlePageChange = (page) => {
        dispatch(fetchAllOrders({ page, limit: pagination.itemsPerPage }));
    };

    const handleItemsPerPageChange = (limit) => {
        dispatch(fetchAllOrders({ page: 1, limit }));
    };

    const handleUpdatePaymentStatus = async () => {
        if (!selectedOrder) return;

        try {
            await dispatch(adminUpdatePaymentStatus({
                orderId: selectedOrder._id,
                paymentStatus,
                transactionId: transactionId.trim() || null
            })).unwrap();

            setShowPaymentModal(false);
            setSelectedOrder(null);
            setTransactionId('');
            // Refresh orders
            dispatch(fetchAllOrders({ page: pagination.currentPage, limit: pagination.itemsPerPage }));
        } catch (err) {
            console.error('Failed to update payment status:', err);
        }
    };

    const handleUpdateOrderStatus = async () => {
        if (!selectedOrder) return;

        try {
            await dispatch(adminUpdateOrderStatus({
                orderId: selectedOrder._id,
                status: orderStatus
            })).unwrap();

            setShowStatusModal(false);
            setSelectedOrder(null);
            // Refresh orders
            dispatch(fetchAllOrders({ page: pagination.currentPage, limit: pagination.itemsPerPage }));
        } catch (err) {
            console.error('Failed to update order status:', err);
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
            <span
                className="badge badge-xs px-2 py-0.5 font-medium"
                style={{ backgroundColor: config.bg, color: config.color, border: 'none' }}
            >
                {config.label}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: t('orders.paymentStatus.pending') || 'Pending', bg: '#fef3c7', color: '#92400e' },
            processing: { label: t('orders.paymentStatus.processing') || 'Processing', bg: '#6B8E6B', color: '#ffffff' },
            paid: { label: t('orders.paymentStatus.paid') || 'Paid', bg: '#d1fae5', color: '#065f46' },
            failed: { label: t('orders.paymentStatus.failed') || 'Failed', bg: '#fee2e2', color: '#991b1b' },
            refunded: { label: t('orders.paymentStatus.refunded') || 'Refunded', bg: '#fee2e2', color: '#991b1b' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span
                className="badge badge-xs px-2 py-0.5 font-medium"
                style={{ backgroundColor: config.bg, color: config.color, border: 'none' }}
            >
                {config.label}
            </span>
        );
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Page Header */}
                <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5 mb-6" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: primaryTextColor }}>
                        {t('admin.orders.title') || 'Orders Management'}
                    </h1>
                    <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                        {t('admin.orders.subtitle') || 'View and manage all orders'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-6">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && orders.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <Loading />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-base-100 rounded-lg shadow-sm border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                <svg
                                    className="w-10 h-10 sm:w-12 sm:h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: secondaryTextColor }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: primaryTextColor }}>
                                    {t('admin.orders.noOrders') || 'No Orders Found'}
                                </h3>
                                <p className="text-sm sm:text-base opacity-70 px-4" style={{ color: secondaryTextColor }}>
                                    No orders have been placed yet.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Orders Table */}
                        <div className="bg-base-100 rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: buttonColor }}>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Order ID</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Customer</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Items</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Total</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Payment</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Status</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Date</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order._id} className="transition-colors border-b" style={{ borderColor: secondaryTextColor }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="font-mono text-xs sm:text-sm font-medium" style={{ color: primaryTextColor }}>
                                                        {order.orderId || order._id}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                                        {order.user?.profile?.name || order.user?.mobile || 'N/A'}
                                                    </div>
                                                    <div className="text-xs opacity-70 mt-0.5" style={{ color: secondaryTextColor }}>
                                                        {order.user?.profile?.email || order.user?.mobile || ''}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm" style={{ color: primaryTextColor }}>
                                                        {t('orders.items', { count: order.items?.length || 0 }) || `${order.items?.length || 0} item(s)`}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-semibold text-sm" style={{ color: primaryTextColor }}>
                                                        {formatCurrency(order.total)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{getPaymentStatusBadge(order.paymentStatus)}</td>
                                                <td className="py-3 px-4">{getStatusBadge(order.orderStatus)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="text-xs" style={{ color: secondaryTextColor }}>
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setPaymentStatus(order.paymentStatus || 'pending');
                                                                setShowPaymentModal(true);
                                                            }}
                                                            className="btn btn-xs text-white px-3 py-1.5 font-medium transition-all duration-200 hover:shadow-sm"
                                                            style={{ backgroundColor: buttonColor, paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                                                        >
                                                            {t('admin.orders.updatePayment') || 'Payment'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setOrderStatus(order.orderStatus || 'pending');
                                                                setShowStatusModal(true);
                                                            }}
                                                            className="btn btn-xs text-white px-3 py-1.5 font-medium transition-all duration-200 hover:shadow-sm"
                                                            style={{ backgroundColor: buttonColor, paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                                                        >
                                                            {t('admin.orders.updateStatus') || 'Status'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    totalItems={pagination.totalItems}
                                    itemsPerPage={pagination.itemsPerPage}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Payment Status Modal */}
                {showPaymentModal && selectedOrder && (
                    <div className="modal modal-open">
                        <div className="modal-box" style={{ backgroundColor }}>
                            <h3 className="font-bold text-lg mb-4" style={{ color: primaryTextColor }}>
                                {t('admin.orders.updatePaymentStatus') || 'Update Payment Status'}
                            </h3>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text" style={{ color: primaryTextColor }}>
                                        {t('admin.orders.paymentStatus') || 'Payment Status'}
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text" style={{ color: primaryTextColor }}>
                                        {t('admin.orders.transactionId') || 'Transaction ID'} ({t('common.optional') || 'Optional'})
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction ID"
                                    style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor }}
                                />
                            </div>
                            <div className="modal-action">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedOrder(null);
                                        setTransactionId('');
                                    }}
                                    style={{ color: primaryTextColor }}
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="btn btn-primary text-white"
                                    onClick={handleUpdatePaymentStatus}
                                    style={{ backgroundColor: buttonColor }}
                                >
                                    {t('common.update') || 'Update'}
                                </button>
                            </div>
                        </div>
                        <div className="modal-backdrop" onClick={() => {
                            setShowPaymentModal(false);
                            setSelectedOrder(null);
                            setTransactionId('');
                        }}></div>
                    </div>
                )}

                {/* Order Status Modal */}
                {showStatusModal && selectedOrder && (
                    <div className="modal modal-open">
                        <div className="modal-box" style={{ backgroundColor }}>
                            <h3 className="font-bold text-lg mb-4" style={{ color: primaryTextColor }}>
                                {t('admin.orders.updateOrderStatus') || 'Update Order Status'}
                            </h3>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text" style={{ color: primaryTextColor }}>
                                        {t('admin.orders.orderStatus') || 'Order Status'}
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={orderStatus}
                                    onChange={(e) => setOrderStatus(e.target.value)}
                                    style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="modal-action">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setSelectedOrder(null);
                                    }}
                                    style={{ color: primaryTextColor }}
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="btn btn-primary text-white"
                                    onClick={handleUpdateOrderStatus}
                                    style={{ backgroundColor: buttonColor }}
                                >
                                    {t('common.update') || 'Update'}
                                </button>
                            </div>
                        </div>
                        <div className="modal-backdrop" onClick={() => {
                            setShowStatusModal(false);
                            setSelectedOrder(null);
                        }}></div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminOrderList;

