/**
 * Order Card Component
 * 
 * Displays a single order in card format for order history
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/helpers';

function OrderCard({ order }) {
    const { t } = useTranslation();

    if (!order) return null;

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
            <span className={`badge badge-sm ${config.className}`}>
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
            <span className={`badge badge-sm ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const itemCount = order.items?.length || 0;

    return (
        <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-300 border border-base-200">
            <div className="card-body p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#1E293B' }}>
                                {order.orderId || order._id}
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm opacity-70" style={{ color: '#2d3748' }}>
                            {t('orders.placedOn') || 'Placed on'} {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {getStatusBadge(order.orderStatus)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                </div>

                {/* Items Preview */}
                <div className="mb-4">
                    <p className="text-sm font-medium mb-2" style={{ color: '#1E293B' }}>
                        {t('orders.items', { count: itemCount }) || `${itemCount} item(s)`}
                    </p>
                    <div className="space-y-2">
                        {order.items?.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-base-200 flex-shrink-0">
                                    <img
                                        src={item.productSnapshot?.thumbnail || item.product?.thumbnail || 'https://via.placeholder.com/100'}
                                        alt={item.productSnapshot?.name || item.product?.name || 'Product'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/100';
                                        }}
                                    />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-medium truncate" style={{ color: '#1E293B' }}>
                                        {item.productSnapshot?.name || item.product?.name || 'Product'}
                                    </p>
                                    <p className="text-xs opacity-70" style={{ color: '#2d3748' }}>
                                        {t('orders.quantity') || 'Qty'}: {item.quantity} × {formatCurrency(item.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {itemCount > 3 && (
                            <p className="text-xs opacity-70 text-center pt-2" style={{ color: '#2d3748' }}>
                                +{itemCount - 3} {t('orders.moreItems') || 'more items'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#e2e8f0' }}>
                    <span className="text-sm font-medium" style={{ color: '#2d3748' }}>
                        {t('orders.total') || 'Total'}
                    </span>
                    <span className="text-lg font-bold" style={{ color: '#1E293B' }}>
                        {formatCurrency(order.total)}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-outline btn-sm flex-grow"
                        style={{ borderColor: '#1E293B', color: '#1E293B' }}
                    >
                        {t('orders.viewDetails') || 'View Details'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderCard;

