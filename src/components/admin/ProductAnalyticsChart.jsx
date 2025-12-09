/**
 * Product Analytics Chart Component
 * Displays product-related statistics and charts
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import { useThemeColors } from '../../hooks/useThemeColors';

const COLORS = ['#1E293B', '#6B8E6B', '#64748b', '#94a3b8', '#cbd5e1'];

function ProductAnalyticsChart({ products, overview }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, successColor } = useThemeColors();

    // Top selling products data
    const topProductsData = products?.topSelling?.slice(0, 5).map((item, index) => ({
        name: item.product?.name?.substring(0, 15) || `Product ${index + 1}`,
        sales: item.quantity || 0,
        revenue: item.revenue || 0
    })) || [];

    // Product sales trend (mock data - can be enhanced)
    const salesTrendData = [
        { month: 'Jan', sales: 45 },
        { month: 'Feb', sales: 52 },
        { month: 'Mar', sales: 48 },
        { month: 'Apr', sales: 61 },
        { month: 'May', sales: 55 },
        { month: 'Jun', sales: 68 }
    ];

    return (
        <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                    {t('admin.dashboard.productAnalytics') || 'Product Analytics'}
                </h2>
                <Link
                    to="/admin/products"
                    className="btn btn-sm px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: buttonColor, minHeight: '36px' }}
                >
                    {t('admin.dashboard.viewAll') || 'View All →'}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Products */}
                <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.topSellingProducts') || 'Top 5 Selling Products'}
                    </h3>
                    {topProductsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={topProductsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={secondaryTextColor} opacity={0.3} />
                                <XAxis type="number" stroke={secondaryTextColor} tick={{ fill: secondaryTextColor }} />
                                <YAxis dataKey="name" type="category" width={100} stroke={secondaryTextColor} tick={{ fill: secondaryTextColor }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: backgroundColor,
                                        border: `1px solid ${secondaryTextColor}`,
                                        borderRadius: '8px',
                                        color: primaryTextColor
                                    }}
                                    labelStyle={{ color: primaryTextColor }}
                                />
                                <Legend wrapperStyle={{ color: primaryTextColor }} />
                                <Bar dataKey="sales" fill={buttonColor} radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-sm" style={{ color: secondaryTextColor }}>
                                {t('admin.dashboard.noData') || 'No data available'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Sales Trend */}
                <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.salesTrend') || 'Sales Trend (Last 6 Months)'}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={salesTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={secondaryTextColor} opacity={0.3} />
                            <XAxis dataKey="month" stroke={secondaryTextColor} tick={{ fill: secondaryTextColor }} />
                            <YAxis stroke={secondaryTextColor} tick={{ fill: secondaryTextColor }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: backgroundColor,
                                    border: `1px solid ${secondaryTextColor}`,
                                    borderRadius: '8px',
                                    color: primaryTextColor
                                }}
                                labelStyle={{ color: primaryTextColor }}
                            />
                            <Legend wrapperStyle={{ color: primaryTextColor }} />
                            <Line type="monotone" dataKey="sales" stroke={successColor || '#6B8E6B'} strokeWidth={2} dot={{ fill: successColor || '#6B8E6B', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t" style={{ borderColor: secondaryTextColor }}>
                <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: primaryTextColor }}>
                        {overview?.totalProducts || 0}
                    </p>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.totalProducts') || 'Total Products'}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: successColor || '#6B8E6B' }}>
                        {topProductsData.reduce((sum, item) => sum + item.sales, 0)}
                    </p>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.totalSales') || 'Total Sales'}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: primaryTextColor }}>
                        {formatCurrency(topProductsData.reduce((sum, item) => sum + item.revenue, 0))}
                    </p>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.totalRevenue') || 'Total Revenue'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProductAnalyticsChart;

