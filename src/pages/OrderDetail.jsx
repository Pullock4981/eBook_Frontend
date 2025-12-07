/**
 * Order Detail Page
 * 
 * Detailed order information page
 */

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, selectCurrentOrder, selectOrdersLoading, selectOrdersError, clearCurrentOrder } from '../store/slices/orderSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import Loading from '../components/common/Loading';
import { formatCurrency } from '../utils/helpers';
import { PRODUCT_TYPES } from '../utils/constants';

function OrderDetail() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const order = useSelector(selectCurrentOrder);
    const isLoading = useSelector(selectOrdersLoading);
    const error = useSelector(selectOrdersError);

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

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFECE3' }}>
                <Loading />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
                <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                    <div className="card bg-base-100 shadow-sm">
                        <div className="card-body text-center py-12">
                            <div className="text-6xl mb-4">❌</div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>
                                {t('orders.notFound') || 'Order Not Found'}
                            </h2>
                            <p className="text-base opacity-70 mb-4" style={{ color: '#2d3748' }}>
                                {error || t('orders.notFoundDescription') || 'The order you are looking for does not exist.'}
                            </p>
                            <Link
                                to="/orders"
                                className="btn btn-primary text-white"
                                style={{ backgroundColor: '#1E293B' }}
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
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Back Button */}
                <div className="mb-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#1E293B' }}
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
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                                {t('orders.orderDetails') || 'Order Details'}
                            </h1>
                            <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                                {order.orderId || order._id}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {getStatusBadge(order.orderStatus)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {/* Left Column - Order Items & Info */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
                        {/* Order Items */}
                        <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                            <div className="card-body p-4">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E293B' }}>
                                    {t('orders.orderItems') || 'Order Items'}
                                </h3>
                                <div className="space-y-4">
                                    {order.items?.map((item, index) => {
                                        const product = item.product || {};
                                        const productName = item.productSnapshot?.name || product.name || 'Product';
                                        const productImage = item.productSnapshot?.thumbnail || product.thumbnail || 'https://via.placeholder.com/100';
                                        const isPhysical = item.type === PRODUCT_TYPES.PHYSICAL || product.type === PRODUCT_TYPES.PHYSICAL;

                                        return (
                                            <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#e2e8f0' }}>
                                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-base-200 flex-shrink-0">
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
                                                    <h4 className="text-base sm:text-lg font-semibold mb-1" style={{ color: '#1E293B' }}>
                                                        {productName}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`badge badge-sm ${isPhysical ? 'badge-primary' : 'badge-secondary'}`}>
                                                            {isPhysical ? t('products.physical') : t('products.digital')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                                                            {t('orders.quantity') || 'Qty'}: {item.quantity} × {formatCurrency(item.price)}
                                                        </span>
                                                        <span className="text-base font-semibold" style={{ color: '#1E293B' }}>
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
                            <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                                <div className="card-body p-4">
                                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E293B' }}>
                                        {t('orders.shippingAddress') || 'Shipping Address'}
                                    </h3>
                                    <div className="space-y-1">
                                        <p className="font-medium" style={{ color: '#1E293B' }}>
                                            {order.shippingAddress.name}
                                        </p>
                                        <p className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                                            {order.shippingAddress.addressLine1}
                                            {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                        </p>
                                        <p className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                        </p>
                                        <p className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                                            {order.shippingAddress.country}
                                        </p>
                                        {order.shippingAddress.phone && (
                                            <p className="text-sm opacity-70 mt-2" style={{ color: '#2d3748' }}>
                                                {t('common.phone') || 'Phone'}: {order.shippingAddress.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Notes */}
                        {order.notes && (
                            <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                                <div className="card-body p-4">
                                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E293B' }}>
                                        {t('orders.notes') || 'Order Notes'}
                                    </h3>
                                    <p className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                                        {order.notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card bg-base-100 shadow-lg border-2 sticky top-16 sm:top-20" style={{ borderColor: '#e2e8f0' }}>
                            <div className="card-body p-4">
                                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E293B' }}>
                                    {t('orders.orderSummary') || 'Order Summary'}
                                </h3>

                                {/* Order Info */}
                                <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor: '#e2e8f0' }}>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70" style={{ color: '#2d3748' }}>
                                            {t('orders.orderDate') || 'Order Date'}
                                        </span>
                                        <span style={{ color: '#1E293B' }}>
                                            {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    {order.shippedDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: '#2d3748' }}>
                                                {t('orders.shippedDate') || 'Shipped Date'}
                                            </span>
                                            <span style={{ color: '#1E293B' }}>
                                                {formatDate(order.shippedDate)}
                                            </span>
                                        </div>
                                    )}
                                    {order.deliveredDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: '#2d3748' }}>
                                                {t('orders.deliveredDate') || 'Delivered Date'}
                                            </span>
                                            <span style={{ color: '#1E293B' }}>
                                                {formatDate(order.deliveredDate)}
                                            </span>
                                        </div>
                                    )}
                                    {order.trackingNumber && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: '#2d3748' }}>
                                                {t('orders.trackingNumber') || 'Tracking Number'}
                                            </span>
                                            <span style={{ color: '#1E293B' }}>
                                                {order.trackingNumber}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Info */}
                                <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor: '#e2e8f0' }}>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70" style={{ color: '#2d3748' }}>
                                            {t('orders.paymentMethod') || 'Payment Method'}
                                        </span>
                                        <span className="capitalize" style={{ color: '#1E293B' }}>
                                            {order.paymentMethod?.replace('_', ' ') || '-'}
                                        </span>
                                    </div>
                                    {order.paymentTransactionId && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: '#2d3748' }}>
                                                {t('orders.transactionId') || 'Transaction ID'}
                                            </span>
                                            <span className="font-mono text-xs" style={{ color: '#1E293B' }}>
                                                {order.paymentTransactionId}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-2 mb-4 pb-4 border-b" style={{ borderColor: '#e2e8f0' }}>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70" style={{ color: '#2d3748' }}>
                                            {t('cart.subtotal') || 'Subtotal'}
                                        </span>
                                        <span style={{ color: '#1E293B' }}>
                                            {formatCurrency(order.subtotal)}
                                        </span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm text-success">
                                            <span>{t('cart.discount') || 'Discount'}</span>
                                            <span>-{formatCurrency(order.discount)}</span>
                                        </div>
                                    )}
                                    {order.shipping > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="opacity-70" style={{ color: '#2d3748' }}>
                                                {t('checkout.shipping') || 'Shipping'}
                                            </span>
                                            <span style={{ color: '#1E293B' }}>
                                                {formatCurrency(order.shipping)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold" style={{ color: '#1E293B' }}>
                                        {t('cart.total') || 'Total'}
                                    </span>
                                    <span className="text-xl font-bold" style={{ color: '#1E293B' }}>
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetail;

