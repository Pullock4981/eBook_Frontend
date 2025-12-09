/**
 * Payment Analytics Chart Component
 * Displays payment and revenue-related statistics and charts
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import { useThemeColors } from '../../hooks/useThemeColors';

const COLORS = ['#1E293B', '#6B8E6B', '#059669', '#10b981', '#34d399'];

function PaymentAnalyticsChart({ revenue, orders }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, successColor } = useThemeColors();

    // Revenue trends data (from backend or mock)
    const revenueTrendsData = revenue?.trends?.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: item.revenue || 0
    })) || [
            { date: 'Jan 1', revenue: 1200 },
            { date: 'Jan 8', revenue: 1500 },
            { date: 'Jan 15', revenue: 1800 },
            { date: 'Jan 22', revenue: 2100 },
            { date: 'Jan 29', revenue: 2400 },
            { date: 'Feb 5', revenue: revenue?.byPeriod?.today || 0 }
        ];

    // Payment status distribution
    const paymentStatusData = orders?.byStatus ? [
        { name: t('orders.status.pending') || 'Pending', value: orders.byStatus.pending || 0 },
        { name: t('orders.status.confirmed') || 'Confirmed', value: orders.byStatus.confirmed || 0 },
        { name: t('orders.status.delivered') || 'Delivered', value: orders.byStatus.delivered || 0 },
        { name: t('orders.status.cancelled') || 'Cancelled', value: orders.byStatus.cancelled || 0 }
    ].filter(item => item.value > 0) : [];

    const chartColor = successColor || '#6B8E6B';

    return (
        <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                    {t('admin.dashboard.paymentAnalytics') || 'Payment & Revenue Analytics'}
                </h2>
                <Link
                    to="/admin/orders"
                    className="btn btn-sm px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: buttonColor, minHeight: '36px' }}
                >
                    {t('admin.dashboard.viewAll') || 'View All →'}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.revenueTrend') || 'Revenue Trend (Last 30 Days)'}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={revenueTrendsData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={secondaryTextColor} opacity={0.3} />
                            <XAxis dataKey="date" stroke={secondaryTextColor} tick={{ fill: secondaryTextColor }} />
                            <YAxis stroke={secondaryTextColor} tick={{ fill: secondaryTextColor }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: backgroundColor,
                                    border: `1px solid ${secondaryTextColor}`,
                                    borderRadius: '8px',
                                    color: primaryTextColor
                                }}
                                labelStyle={{ color: primaryTextColor }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend wrapperStyle={{ color: primaryTextColor }} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke={chartColor}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Order Status Distribution */}
                <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.orderStatusDistribution') || 'Order Status Distribution'}
                    </h3>
                    {paymentStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={paymentStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {paymentStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: backgroundColor,
                                        border: `1px solid ${secondaryTextColor}`,
                                        borderRadius: '8px',
                                        color: primaryTextColor
                                    }}
                                    labelStyle={{ color: primaryTextColor }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-sm" style={{ color: secondaryTextColor }}>
                                {t('admin.dashboard.noData') || 'No data available'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Revenue Summary */}
            {revenue?.byPeriod && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: secondaryTextColor }}>
                    <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: primaryTextColor }}>
                            {formatCurrency(revenue.byPeriod.today || 0)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                            {t('admin.dashboard.today') || 'Today'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: successColor || '#6B8E6B' }}>
                            {formatCurrency(revenue.byPeriod.last7Days || 0)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                            {t('admin.dashboard.last7Days') || 'Last 7 Days'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: primaryTextColor }}>
                            {formatCurrency(revenue.byPeriod.last30Days || 0)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                            {t('admin.dashboard.last30Days') || 'Last 30 Days'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: successColor || '#6B8E6B' }}>
                            {formatCurrency(revenue.byPeriod.last90Days || 0)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                            {t('admin.dashboard.last90Days') || 'Last 90 Days'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentAnalyticsChart;

