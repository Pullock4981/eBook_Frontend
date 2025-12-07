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

function AdminOrderList() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
            pending: { label: t('orders.status.pending') || 'Pending', className: 'badge-warning' },
            confirmed: { label: t('orders.status.confirmed') || 'Confirmed', className: 'badge-info' },
            processing: { label: t('orders.status.processing') || 'Processing', className: 'badge-info' },
            shipped: { label: t('orders.status.shipped') || 'Shipped', className: 'badge-primary' },
            delivered: { label: t('orders.status.delivered') || 'Delivered', className: 'badge-success' },
            cancelled: { label: t('orders.status.cancelled') || 'Cancelled', className: 'badge-error' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`badge badge-sm ${config.className}`}>{config.label}</span>;
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: t('orders.paymentStatus.pending') || 'Pending', className: 'badge-warning' },
            processing: { label: t('orders.paymentStatus.processing') || 'Processing', className: 'badge-info' },
            paid: { label: t('orders.paymentStatus.paid') || 'Paid', className: 'badge-success' },
            failed: { label: t('orders.paymentStatus.failed') || 'Failed', className: 'badge-error' },
            refunded: { label: t('orders.paymentStatus.refunded') || 'Refunded', className: 'badge-error' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`badge badge-sm ${config.className}`}>{config.label}</span>;
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('admin.orders.title') || 'Orders Management'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
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
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body text-center py-12">
                            <p className="text-lg" style={{ color: '#1E293B' }}>
                                {t('admin.orders.noOrders') || 'No orders found'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Orders Table */}
                        <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                            <div className="card-body p-0 overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                                            <th style={{ color: '#1E293B' }}>Order ID</th>
                                            <th style={{ color: '#1E293B' }}>Customer</th>
                                            <th style={{ color: '#1E293B' }}>Items</th>
                                            <th style={{ color: '#1E293B' }}>Total</th>
                                            <th style={{ color: '#1E293B' }}>Payment</th>
                                            <th style={{ color: '#1E293B' }}>Status</th>
                                            <th style={{ color: '#1E293B' }}>Date</th>
                                            <th style={{ color: '#1E293B' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover">
                                                <td>
                                                    <div className="font-mono text-xs sm:text-sm" style={{ color: '#1E293B' }}>
                                                        {order.orderId || order._id}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-sm" style={{ color: '#1E293B' }}>
                                                        {order.user?.profile?.name || order.user?.mobile || 'N/A'}
                                                    </div>
                                                    <div className="text-xs opacity-70" style={{ color: '#2d3748' }}>
                                                        {order.user?.profile?.email || order.user?.mobile || ''}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-sm" style={{ color: '#1E293B' }}>
                                                        {order.items?.length || 0} {t('orders.items', { count: order.items?.length || 0 }) || 'item(s)'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="font-semibold" style={{ color: '#1E293B' }}>
                                                        {formatCurrency(order.total)}
                                                    </div>
                                                </td>
                                                <td>{getPaymentStatusBadge(order.paymentStatus)}</td>
                                                <td>{getStatusBadge(order.orderStatus)}</td>
                                                <td>
                                                    <div className="text-xs" style={{ color: '#2d3748' }}>
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => navigate(`/orders/${order._id}`)}
                                                            className="btn btn-xs btn-ghost"
                                                            style={{ color: '#1E293B' }}
                                                        >
                                                            {t('common.view') || 'View'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setPaymentStatus(order.paymentStatus || 'pending');
                                                                setShowPaymentModal(true);
                                                            }}
                                                            className="btn btn-xs btn-primary text-white"
                                                            style={{ backgroundColor: '#1E293B' }}
                                                        >
                                                            {t('admin.orders.updatePayment') || 'Payment'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setOrderStatus(order.orderStatus || 'pending');
                                                                setShowStatusModal(true);
                                                            }}
                                                            className="btn btn-xs btn-outline"
                                                            style={{ borderColor: '#1E293B', color: '#1E293B' }}
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
                        <div className="modal-box">
                            <h3 className="font-bold text-lg mb-4" style={{ color: '#1E293B' }}>
                                {t('admin.orders.updatePaymentStatus') || 'Update Payment Status'}
                            </h3>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text" style={{ color: '#1E293B' }}>
                                        {t('admin.orders.paymentStatus') || 'Payment Status'}
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    style={{ borderColor: '#cbd5e1', color: '#1E293B' }}
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
                                    <span className="label-text" style={{ color: '#1E293B' }}>
                                        {t('admin.orders.transactionId') || 'Transaction ID'} ({t('common.optional') || 'Optional'})
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter transaction ID"
                                    style={{ borderColor: '#cbd5e1', color: '#1E293B' }}
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
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="btn btn-primary text-white"
                                    onClick={handleUpdatePaymentStatus}
                                    style={{ backgroundColor: '#1E293B' }}
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
                        <div className="modal-box">
                            <h3 className="font-bold text-lg mb-4" style={{ color: '#1E293B' }}>
                                {t('admin.orders.updateOrderStatus') || 'Update Order Status'}
                            </h3>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text" style={{ color: '#1E293B' }}>
                                        {t('admin.orders.orderStatus') || 'Order Status'}
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={orderStatus}
                                    onChange={(e) => setOrderStatus(e.target.value)}
                                    style={{ borderColor: '#cbd5e1', color: '#1E293B' }}
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
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="btn btn-primary text-white"
                                    onClick={handleUpdateOrderStatus}
                                    style={{ backgroundColor: '#1E293B' }}
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

