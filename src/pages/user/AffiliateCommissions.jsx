/**
 * Affiliate Commissions Page
 * 
 * Shows all commissions for the affiliate user with filtering and pagination
 */

import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCommissions,
    selectCommissions,
    selectAffiliateLoading,
    selectAffiliatePagination
} from '../../store/slices/affiliateSlice';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { useThemeColors } from '../../hooks/useThemeColors';

function AffiliateCommissions() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, successColor, warningColor, infoColor, errorColor } = useThemeColors();
    const commissions = useSelector(selectCommissions);
    const loading = useSelector(selectAffiliateLoading);
    const pagination = useSelector(selectAffiliatePagination);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
        dispatch(fetchCommissions(filters, currentPage, limit));
    }, [dispatch, statusFilter, currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        const total = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const pending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0);
        const approved = commissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.amount || 0), 0);
        const paid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + (c.amount || 0), 0);

        return {
            total,
            pending,
            approved,
            paid,
            totalCount: commissions.length,
            pendingCount: commissions.filter(c => c.status === 'pending').length,
            approvedCount: commissions.filter(c => c.status === 'approved').length,
            paidCount: commissions.filter(c => c.status === 'paid').length
        };
    }, [commissions]);

    const getStatusBadgeStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid':
                return { backgroundColor: successColor, color: '#ffffff', border: 'none' };
            case 'approved':
                return { backgroundColor: infoColor, color: '#ffffff', border: 'none' };
            case 'cancelled':
                return { backgroundColor: errorColor, color: '#ffffff', border: 'none' };
            case 'pending':
            default:
                return { backgroundColor: warningColor, color: '#ffffff', border: 'none' };
        }
    };

    return (
        <div className="w-full pb-4" style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('nav.commission') || 'My Commissions'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        Track all your commission earnings and performance
                    </p>
                </div>

                {/* Summary Statistics Cards */}
                {!loading && commissions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                        {/* Total Commission */}
                        <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                        Total Commission
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold" style={{ color: primaryTextColor }}>
                                        {formatCurrency(summaryStats.total)}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                                        {summaryStats.totalCount} {summaryStats.totalCount === 1 ? 'commission' : 'commissions'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: infoColor + '20' }}>
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: infoColor }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Pending Commission */}
                        <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                        Pending
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold" style={{ color: warningColor }}>
                                        {formatCurrency(summaryStats.pending)}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                                        {summaryStats.pendingCount} {summaryStats.pendingCount === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: warningColor + '20' }}>
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: warningColor }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Approved Commission */}
                        <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                        Approved
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold" style={{ color: infoColor }}>
                                        {formatCurrency(summaryStats.approved)}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                                        {summaryStats.approvedCount} {summaryStats.approvedCount === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: infoColor + '20' }}>
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: infoColor }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Paid Commission */}
                        <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm opacity-70 mb-1" style={{ color: secondaryTextColor }}>
                                        Paid
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold" style={{ color: successColor }}>
                                        {formatCurrency(summaryStats.paid)}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                                        {summaryStats.paidCount} {summaryStats.paidCount === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: successColor + '20' }}>
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: successColor }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center flex-1">
                            <label className="text-sm sm:text-base font-medium whitespace-nowrap" style={{ color: primaryTextColor }}>
                                Filter by Status:
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="select select-bordered px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base flex-1 sm:flex-none sm:w-48 w-full"
                                style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                            >
                                <option value="all">All Commissions</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        {!loading && commissions.length > 0 && (
                            <div className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, pagination.commissions.total || commissions.length)} of {pagination.commissions.total || commissions.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Commissions Table */}
                <div className="rounded-lg shadow-sm p-4 sm:p-6 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loading />
                        </div>
                    ) : commissions.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: secondaryTextColor }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: primaryTextColor }}>
                                No Commissions Found
                            </h3>
                            <p className="text-sm sm:text-base mb-4" style={{ color: secondaryTextColor }}>
                                {statusFilter !== 'all'
                                    ? `No ${statusFilter} commissions found. Try selecting a different filter.`
                                    : "You haven't earned any commissions yet. Start sharing your referral link to earn commissions!"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <table className="table w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: buttonColor }}>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-3 sm:px-4 text-white whitespace-nowrap">Order ID</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-3 sm:px-4 text-white whitespace-nowrap">Referred User</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-3 sm:px-4 text-white whitespace-nowrap">Order Amount</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-3 sm:px-4 text-white whitespace-nowrap">Commission</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-3 sm:px-4 text-white whitespace-nowrap">Rate</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-3 sm:px-4 text-white whitespace-nowrap">Status</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-3 sm:px-4 text-white whitespace-nowrap">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissions.map((commission, index) => (
                                            <tr
                                                key={commission.id}
                                                className="border-b transition-colors"
                                                style={{ borderColor: secondaryTextColor, backgroundColor: index % 2 === 0 ? backgroundColor : secondaryTextColor + '10' }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? backgroundColor : secondaryTextColor + '10';
                                                }}
                                            >
                                                <td className="py-3 px-3 sm:px-4">
                                                    <span className="text-xs sm:text-sm font-mono font-medium" style={{ color: primaryTextColor }}>
                                                        {commission.order?.orderId || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 sm:px-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs sm:text-sm font-medium" style={{ color: primaryTextColor }}>
                                                            {commission.referredUser?.name || 'N/A'}
                                                        </span>
                                                        {commission.referredUser?.email && (
                                                            <span className="text-xs opacity-70" style={{ color: secondaryTextColor }}>
                                                                {commission.referredUser.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 sm:px-4">
                                                    <span className="text-xs sm:text-sm font-medium" style={{ color: secondaryTextColor }}>
                                                        {formatCurrency(commission.orderAmount || 0)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 sm:px-4">
                                                    <span className="text-xs sm:text-sm font-semibold" style={{ color: successColor }}>
                                                        {formatCurrency(commission.amount || 0)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 sm:px-4">
                                                    <span className="text-xs sm:text-sm font-medium" style={{ color: secondaryTextColor }}>
                                                        {commission.commissionRate || 0}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 sm:px-4">
                                                    <span
                                                        className="badge badge-sm px-2 py-1 font-medium capitalize"
                                                        style={getStatusBadgeStyle(commission.status)}
                                                    >
                                                        {commission.status || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 sm:px-4">
                                                    <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                        {formatDate(commission.createdAt)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.commissions.pages > 1 && (
                                <div className="mt-6 pt-4 border-t" style={{ borderColor: secondaryTextColor }}>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={pagination.commissions.pages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AffiliateCommissions;

