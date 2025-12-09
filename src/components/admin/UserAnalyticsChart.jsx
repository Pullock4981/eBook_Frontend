/**
 * User Analytics Chart Component
 * Displays user-related statistics and charts
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useThemeColors } from '../../hooks/useThemeColors';

const COLORS = ['#1E293B', '#6B8E6B', '#64748b', '#94a3b8'];

function UserAnalyticsChart({ overview, userStats }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();

    // Prepare data for user growth chart (mock data for now - can be enhanced with real data)
    const userGrowthData = [
        { name: 'Jan', users: 120 },
        { name: 'Feb', users: 150 },
        { name: 'Mar', users: 180 },
        { name: 'Apr', users: 200 },
        { name: 'May', users: 250 },
        { name: 'Jun', users: overview?.totalUsers || 0 }
    ];

    // User role distribution
    const roleDistributionData = [
        { name: t('admin.dashboard.users') || 'Users', value: overview?.totalUsers ? overview.totalUsers - 1 : 0 },
        { name: t('admin.dashboard.admins') || 'Admins', value: 1 }
    ];

    return (
        <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold" style={{ color: primaryTextColor }}>
                    {t('admin.dashboard.userAnalytics') || 'User Analytics'}
                </h2>
                <Link
                    to="/admin/users"
                    className="btn btn-sm px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: buttonColor, minHeight: '36px' }}
                >
                    {t('admin.dashboard.viewAll') || 'View All →'}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.userGrowth') || 'User Growth (Last 6 Months)'}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={secondaryTextColor} opacity={0.3} />
                            <XAxis dataKey="name" stroke={secondaryTextColor} tick={{ fill: secondaryTextColor }} />
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
                            <Bar dataKey="users" fill={buttonColor} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Role Distribution */}
                <div>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: secondaryTextColor }}>
                        {t('admin.dashboard.roleDistribution') || 'Role Distribution'}
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={roleDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {roleDistributionData.map((entry, index) => (
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
                </div>
            </div>
        </div>
    );
}

export default UserAnalyticsChart;

