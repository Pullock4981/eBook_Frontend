/**
 * Order Card Component
 * 
 * Displays a single order in card format for order history
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/helpers';
import { useThemeColors } from '../../hooks/useThemeColors';

function OrderCard({ order }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();

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
        <div className="bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
            <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 pb-4 border-b" style={{ borderColor: secondaryTextColor }}>
                    <div className="flex-grow min-w-0">
                        <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: primaryTextColor }}>
                            {order.orderId || order._id}
                        </h3>
                        <p className="text-xs" style={{ color: secondaryTextColor }}>
                            {t('orders.placedOn') || 'Placed on'} {formatDate(order.createdAt)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
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
                                <div className="w-14 h-14 rounded-md overflow-hidden bg-base-200 flex-shrink-0 border" style={{ borderColor: secondaryTextColor }}>
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
                                    <p className="text-sm font-medium truncate mb-0.5" style={{ color: primaryTextColor }}>
                                        {item.productSnapshot?.name || item.product?.name || 'Product'}
                                    </p>
                                    <p className="text-xs" style={{ color: secondaryTextColor }}>
                                        {t('orders.quantity') || 'Qty'}: {item.quantity} × {formatCurrency(item.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {itemCount > 3 && (
                            <p className="text-xs text-center pt-1" style={{ color: secondaryTextColor }}>
                                +{itemCount - 3} {t('orders.moreItems') || 'more items'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Total and Actions */}
                <div className="pt-4 border-t" style={{ borderColor: secondaryTextColor }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium" style={{ color: secondaryTextColor }}>
                            {t('orders.total') || 'Total'}
                        </span>
                        <span className="text-base font-bold" style={{ color: primaryTextColor }}>
                            {formatCurrency(order.total)}
                        </span>
                    </div>
                    <Link
                        to={`/orders/${order._id}`}
                        className="block w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-sm"
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
                        {t('orders.viewDetails') || 'View Details'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderCard;

