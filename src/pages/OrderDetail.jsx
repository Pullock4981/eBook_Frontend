/**
 * Order Detail Page
 * 
 * Detailed order information page
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, selectCurrentOrder, selectOrdersLoading, selectOrdersError, clearCurrentOrder, adminUpdatePaymentStatus, adminUpdateOrderStatus } from '../store/slices/orderSlice';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import Loading from '../components/common/Loading';
import { formatCurrency } from '../utils/helpers';
import { PRODUCT_TYPES } from '../utils/constants';
import { useThemeColors } from '../hooks/useThemeColors';

function OrderDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const order = useSelector(selectCurrentOrder);
    const isLoading = useSelector(selectOrdersLoading);
    const error = useSelector(selectOrdersError);
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, borderColor } = useThemeColors();

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    // Admin action states
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

        if (id) {
            dispatch(fetchOrderById(id));
        }

        return () => {
            dispatch(clearCurrentOrder());
        };
    }, [dispatch, id, isAuthenticated, navigate]);

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
        return (
            <span className={`badge badge-lg ${config.className}`}>
                {config.label}
            </span>
        );
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
        return (
            <span className={`badge badge-lg ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Admin actions
    const handleUpdatePaymentStatus = async () => {
        if (!order) return;

        try {
            await dispatch(adminUpdatePaymentStatus({
                orderId: order._id,
                paymentStatus,
                transactionId: transactionId.trim() || null
            })).unwrap();

            setShowPaymentModal(false);
            setTransactionId('');
            // Refresh order
            dispatch(fetchOrderById(id));
        } catch (err) {
            console.error('Failed to update payment status:', err);
        }
    };

    const handleUpdateOrderStatus = async () => {
        if (!order) return;

        try {
            await dispatch(adminUpdateOrderStatus({
                orderId: order._id,
                status: orderStatus
            })).unwrap();

            setShowStatusModal(false);
            // Refresh order
            dispatch(fetchOrderById(id));
        } catch (err) {
            console.error('Failed to update order status:', err);
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12" style={{ backgroundColor }}>
                <Loading />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div style={{ backgroundColor }}>
                <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                    <div className="card bg-base-100 shadow-sm" style={{ backgroundColor, borderColor }}>
                        <div className="card-body text-center py-12">
                            <div className="text-6xl mb-4">❌</div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: primaryTextColor }}>
                                {t('orders.notFound') || 'Order Not Found'}
                            </h2>
                            <p className="text-base opacity-70 mb-4" style={{ color: secondaryTextColor }}>
                                {error || t('orders.notFoundDescription') || 'The order you are looking for does not exist.'}
                            </p>
                            <Link
                                to="/orders"
                                className="btn btn-primary text-white"
                                style={{ backgroundColor: buttonColor }}
                            >
                                {t('orders.backToOrders') || 'Back to Orders'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Back Button */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate(isAdmin ? '/admin/orders' : '/orders')}
                        className="btn btn-ghost btn-sm"
                        style={{ color: primaryTextColor }}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('common.back') || 'Back'}
                    </button>
                </div>

                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                                {t('orders.orderDetails') || 'Order Details'}
                            </h1>
                            <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                                {order.orderId || order._id}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {getStatusBadge(order.orderStatus)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                        {/* Admin Actions */}
                        {isAdmin && (
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        setPaymentStatus(order.paymentStatus || 'pending');
                                        setShowPaymentModal(true);
                                    }}
                                    className="btn btn-primary btn-sm text-white"
                                    style={{ backgroundColor: buttonColor }}
                                >
                                    {t('admin.orders.updatePayment') || 'Update Payment'}
                                </button>
                                <button
                                    onClick={() => {
                                        setOrderStatus(order.orderStatus || 'pending');
                                        setShowStatusModal(true);
                                    }}
                                    className="btn btn-outline btn-sm"
                                    style={{ borderColor: buttonColor, color: buttonColor }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = buttonColor;
                                        e.currentTarget.style.color = '#ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = buttonColor;
                                    }}
                                >
                                    {t('admin.orders.updateStatus') || 'Update Status'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {/* Left Column - Order Items & Info */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                        {/* Order Items */}
                        <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor, backgroundColor }}>
                            <div className="card-body p-4">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: primaryTextColor }}>
                                    {t('orders.orderItems') || 'Order Items'}
                                </h3>
                                <div className="space-y-4">
                                    {order.items?.map((item, index) => {
                                        const product = item.product || {};
                                        // Parse productSnapshot if it's a JSON string
                                        let productSnapshot = item.productSnapshot;
                                        if (typeof productSnapshot === 'string') {
                                            try {
                                                productSnapshot = JSON.parse(productSnapshot);
                                            } catch (e) {
                                                productSnapshot = {};
                                            }
                                        }
                                        const productName = productSnapshot?.name || product.name || 'Product';
                                        const productImage = productSnapshot?.thumbnail || product.thumbnail || 'https://via.placeholder.com/100';
                                        const isPhysical = item.type === PRODUCT_TYPES.PHYSICAL || product.type === PRODUCT_TYPES.PHYSICAL;

                                        return (
                                            <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0" style={{ borderColor }}>
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                                    <img
                                                        src={productImage}
                                                        alt={productName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/100';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="text-base sm:text-lg font-semibold mb-1" style={{ color: primaryTextColor }}>
                                                        {productName}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`badge badge-sm ${isPhysical ? 'badge-primary' : 'badge-secondary'}`}>
                                                            {isPhysical ? t('products.physical') : t('products.digital')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                                            {t('orders.quantity') || 'Qty'}: {item.quantity} × {formatCurrency(item.price)}
                                                        </span>
                                                        <span className="text-base font-semibold" style={{ color: primaryTextColor }}>
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address (if physical products) */}
                        {order.shippingAddress && (
                            <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor, backgroundColor }}>
                                <div className="card-body p-4">
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: primaryTextColor }}>
                                        {t('orders.shippingAddress') || 'Shipping Address'}
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="font-medium" style={{ color: primaryTextColor }}>
                                            {order.shippingAddress.name}
                                        </p>
                                        <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                            {order.shippingAddress.addressLine1}
                                            {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                        </p>
                                        <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                        </p>
                                        <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                            {order.shippingAddress.country}
                                        </p>
                                        {order.shippingAddress.phone && (
                                            <p className="text-sm opacity-70 mt-2" style={{ color: secondaryTextColor }}>
                                                {t('common.phone') || 'Phone'}: {order.shippingAddress.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Notes */}
                        {order.notes && (
                            <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor, backgroundColor }}>
                                <div className="card-body p-4">
                                    <h3 className="text-lg font-semibold mb-2" style={{ color: primaryTextColor }}>
                                        {t('orders.notes') || 'Order Notes'}
                                    </h3>
                                    <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                        {order.notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card bg-base-100 shadow-lg border-2 sticky top-16 sm:top-20" style={{ borderColor, backgroundColor }}>
                            <div className="card-body p-4">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: primaryTextColor }}>
                                    {t('orders.orderSummary') || 'Order Summary'}
                                </h3>

                                {/* Order Info */}
                                <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor }}>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70" style={{ color: secondaryTextColor }}>
                                            {t('orders.orderDate') || 'Order Date'}
                                        </span>
                                        <span style={{ color: primaryTextColor }}>
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    {order.shippedDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: secondaryTextColor }}>
                                                {t('orders.shippedDate') || 'Shipped Date'}
                                            </span>
                                            <span style={{ color: primaryTextColor }}>
                                                {formatDate(order.shippedDate)}
                                            </span>
                                        </div>
                                    )}
                                    {order.deliveredDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: secondaryTextColor }}>
                                                {t('orders.deliveredDate') || 'Delivered Date'}
                                            </span>
                                            <span style={{ color: primaryTextColor }}>
                                                {formatDate(order.deliveredDate)}
                                            </span>
                                        </div>
                                    )}
                                    {order.trackingNumber && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: secondaryTextColor }}>
                                                {t('orders.trackingNumber') || 'Tracking Number'}
                                            </span>
                                            <span style={{ color: primaryTextColor }}>
                                                {order.trackingNumber}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Info */}
                                <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor }}>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70" style={{ color: secondaryTextColor }}>
                                            {t('orders.paymentMethod') || 'Payment Method'}
                                        </span>
                                        <span className="capitalize" style={{ color: primaryTextColor }}>
                                            {order.paymentMethod?.replace('_', ' ') || '-'}
                                        </span>
                                    </div>
                                    {order.paymentTransactionId && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: secondaryTextColor }}>
                                                {t('orders.transactionId') || 'Transaction ID'}
                                            </span>
                                            <span className="font-mono text-xs" style={{ color: primaryTextColor }}>
                                                {order.paymentTransactionId}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor }}>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70" style={{ color: secondaryTextColor }}>
                                            {t('cart.subtotal') || 'Subtotal'}
                                        </span>
                                        <span style={{ color: primaryTextColor }}>
                                            {formatCurrency(order.subtotal)}
                                        </span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm text-success">
                                            <span style={{ color: secondaryTextColor }}>{t('cart.discount') || 'Discount'}</span>
                                            <span style={{ color: '#10B981' }}>-{formatCurrency(order.discount)}</span>
                                        </div>
                                    )}
                                    {order.shipping > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: secondaryTextColor }}>
                                                {t('checkout.shipping') || 'Shipping'}
                                            </span>
                                            <span style={{ color: primaryTextColor }}>
                                                {formatCurrency(order.shipping)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold" style={{ color: primaryTextColor }}>
                                        {t('cart.total') || 'Total'}
                                    </span>
                                    <span className="text-xl font-bold" style={{ color: primaryTextColor }}>
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Status Modal (Admin) */}
            {isAdmin && showPaymentModal && order && (
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
                                style={{ borderColor, color: primaryTextColor, backgroundColor }}
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
                                style={{ borderColor, color: primaryTextColor, backgroundColor }}
                            />
                        </div>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setShowPaymentModal(false);
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
                        setTransactionId('');
                    }}></div>
                </div>
            )}

            {/* Order Status Modal (Admin) */}
            {isAdmin && showStatusModal && order && (
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
                                style={{ borderColor, color: primaryTextColor, backgroundColor }}
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
                    }}></div>
                </div>
            )}
        </div>
    );
}

export default OrderDetail;

