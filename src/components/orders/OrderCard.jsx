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
            pending: {
                label: t('orders.status.pending') || 'Pending',
                bgColor: '#fef3c7',
                textColor: '#92400e'
            },
            confirmed: {
                label: t('orders.status.confirmed') || 'Confirmed',
                bgColor: '#dbeafe',
                textColor: '#1e40af'
            },
            processing: {
                label: t('orders.status.processing') || 'Processing',
                bgColor: '#dbeafe',
                textColor: '#1e40af'
            },
            shipped: {
                label: t('orders.status.shipped') || 'Shipped',
                bgColor: '#e0e7ff',
                textColor: '#3730a3'
            },
            delivered: {
                label: t('orders.status.delivered') || 'Delivered',
                bgColor: '#d1fae5',
                textColor: '#065f46'
            },
            cancelled: {
                label: t('orders.status.cancelled') || 'Cancelled',
                bgColor: '#fee2e2',
                textColor: '#991b1b'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span
                className="px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                    backgroundColor: config.bgColor,
                    color: config.textColor
                }}
            >
                {config.label}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                label: t('orders.paymentStatus.pending') || 'Pending',
                bgColor: '#fef3c7',
                textColor: '#92400e'
            },
            processing: {
                label: t('orders.paymentStatus.processing') || 'Processing',
                bgColor: '#dbeafe',
                textColor: '#1e40af'
            },
            paid: {
                label: t('orders.paymentStatus.paid') || 'Paid',
                bgColor: '#d1fae5',
                textColor: '#065f46'
            },
            failed: {
                label: t('orders.paymentStatus.failed') || 'Failed',
                bgColor: '#fee2e2',
                textColor: '#991b1b'
            },
            refunded: {
                label: t('orders.paymentStatus.refunded') || 'Refunded',
                bgColor: '#fee2e2',
                textColor: '#991b1b'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span
                className="px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                    backgroundColor: config.bgColor,
                    color: config.textColor
                }}
            >
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
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border" style={{ borderColor: '#e2e8f0' }}>
            <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 pb-4 border-b" style={{ borderColor: '#f1f5f9' }}>
                    <div className="flex-grow min-w-0">
                        <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: '#1E293B' }}>
                            {order.orderId || order._id}
                        </h3>
                        <p className="text-xs text-gray-500" style={{ color: '#64748b' }}>
                            {t('orders.placedOn') || 'Placed on'} {formatDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1" style={{ color: '#64748b' }}>
                            {t('orders.items', { count: itemCount }) || `${itemCount} item(s)`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(order.orderStatus)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                </div>

                {/* Items Preview */}
                <div className="mb-4">
                    <div className="space-y-3">
                        {order.items?.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border" style={{ borderColor: '#e2e8f0' }}>
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
                                    <p className="text-sm font-medium truncate mb-0.5" style={{ color: '#1E293B' }}>
                                        {item.productSnapshot?.name || item.product?.name || 'Product'}
                                    </p>
                                    <p className="text-xs text-gray-500" style={{ color: '#64748b' }}>
                                        {t('orders.quantity') || 'Qty'}: {item.quantity} × {formatCurrency(item.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {itemCount > 3 && (
                            <p className="text-xs text-center pt-1" style={{ color: '#94a3b8' }}>
                                +{itemCount - 3} {t('orders.moreItems') || 'more items'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Total and Actions */}
                <div className="pt-4 border-t" style={{ borderColor: '#f1f5f9' }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600" style={{ color: '#64748b' }}>
                            {t('orders.total') || 'Total'}
                        </span>
                        <span className="text-base font-bold" style={{ color: '#1E293B' }}>
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                    <Link
                        to={`/orders/${order._id}`}
                        className="block w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm"
                        style={{
                            backgroundColor: '#1E293B',
                            color: '#ffffff',
                            border: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0f172a';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#1E293B';
                        }}
                    >
                        {t('orders.viewDetails') || 'View Details'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderCard;

