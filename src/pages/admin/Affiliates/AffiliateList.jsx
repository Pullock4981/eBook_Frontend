/**
 * Admin Affiliate List Page
 * 
 * Manage all affiliate users - view, approve, reject, suspend
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    getAllAffiliates,
    approveAffiliate,
    rejectAffiliate,
    suspendAffiliate,
    getAffiliateAnalytics
} from '../../../services/adminAffiliateService';
import Loading from '../../../components/common/Loading';
import Pagination from '../../../components/common/Pagination';
import { formatDate } from '../../../utils/helpers';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { showError, showSuccess } from '../../../utils/toast';
import Swal from 'sweetalert2';

function AffiliateList() {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor, successColor, infoColor, warningColor } = useThemeColors();
    const [affiliates, setAffiliates] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, affiliateId: null, reason: '' });

    useEffect(() => {
        fetchAffiliates();
        fetchAnalytics();
    }, [pagination.currentPage, pagination.itemsPerPage, filters.status, filters.search]);

    const fetchAffiliates = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('=== Fetching Affiliates ===');
            console.log('Filters:', filters);
            console.log('Page:', pagination.currentPage, 'Limit:', pagination.itemsPerPage);

            const response = await getAllAffiliates(
                filters,
                pagination.currentPage,
                pagination.itemsPerPage
            );

            console.log('=== API Response ===');
            console.log('Full response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response || {}));
            console.log('Response success:', response?.success);
            console.log('Response data:', response?.data);
            console.log('Affiliates array:', response?.data?.affiliates);
            console.log('Affiliates count:', response?.data?.affiliates?.length || 0);
            console.log('Pagination:', response?.data?.pagination);

            // Handle different response structures
            let affiliatesList = [];
            let paginationData = { totalPages: 1, totalItems: 0 };

            if (response?.success && response?.data) {
                // Standard structure: { success: true, data: { affiliates: [...], pagination: {...} } }
                affiliatesList = response.data.affiliates || [];
                paginationData = response.data.pagination || paginationData;
            } else if (response?.affiliates) {
                // Direct affiliates array: { affiliates: [...], pagination: {...} }
                affiliatesList = Array.isArray(response.affiliates) ? response.affiliates : [];
                paginationData = response.pagination || paginationData;
            } else if (Array.isArray(response)) {
                // Response is directly an array
                affiliatesList = response;
            }

            console.log('=== Setting Affiliates ===');
            console.log('Count:', affiliatesList.length);
            console.log('First affiliate:', affiliatesList[0]);
            console.log('Pagination data:', paginationData);

            setAffiliates(affiliatesList);
            setPagination(prev => ({
                ...prev,
                currentPage: paginationData.currentPage || paginationData.page || prev.currentPage,
                totalPages: paginationData.totalPages || paginationData.pages || 1,
                totalItems: paginationData.totalItems || paginationData.total || 0,
                itemsPerPage: paginationData.itemsPerPage || paginationData.limit || prev.itemsPerPage
            }));
        } catch (error) {
            console.error('=== Error Fetching Affiliates ===');
            console.error('Error:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            setError(error.response?.data?.message || error.message || 'Failed to fetch affiliates');
            setAffiliates([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await getAffiliateAnalytics();
            if (response?.success && response?.data) {
                setAnalytics(response.data);
            }
        } catch (error) {
            // Ignore analytics error
        }
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleItemsPerPageChange = (limit) => {
        setPagination(prev => ({ ...prev, currentPage: 1, itemsPerPage: limit }));
    };

    const handleStatusFilter = (status) => {
        setFilters(prev => ({ ...prev, status }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleSearch = (e) => {
        const search = e.target.value;
        setFilters(prev => ({ ...prev, search }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleApprove = async (affiliateId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You want to approve this affiliate?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Approve',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setActionLoading(affiliateId);
        try {
            await approveAffiliate(affiliateId);
            showSuccess('Affiliate approved successfully!');
            await fetchAffiliates();
            await fetchAnalytics();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to approve affiliate');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal.reason.trim()) {
            showError('Please provide a rejection reason');
            return;
        }

        setActionLoading(rejectModal.affiliateId);
        try {
            await rejectAffiliate(rejectModal.affiliateId, rejectModal.reason);
            showSuccess('Affiliate rejected successfully!');
            setRejectModal({ open: false, affiliateId: null, reason: '' });
            await fetchAffiliates();
            await fetchAnalytics();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to reject affiliate');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSuspend = async (affiliateId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You want to suspend this affiliate?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Suspend',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setActionLoading(affiliateId);
        try {
            await suspendAffiliate(affiliateId);
            showSuccess('Affiliate suspended successfully!');
            await fetchAffiliates();
            await fetchAnalytics();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to suspend affiliate');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: '#FEF3C7', color: '#92400E', text: 'Pending' },
            active: { bg: '#D1FAE5', color: '#065F46', text: 'Active' },
            suspended: { bg: '#FEE2E2', color: '#991B1B', text: 'Suspended' },
            rejected: { bg: '#FEE2E2', color: '#991B1B', text: 'Rejected' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span
                className="badge badge-xs px-2 py-0.5 font-medium"
                style={{ backgroundColor: badge.bg, color: badge.color, border: 'none' }}
            >
                {badge.text}
            </span>
        );
    };

    const pendingCount = affiliates.filter(a => a.status === 'pending').length;

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                <div className="space-y-5 sm:space-y-6">
                    {/* Header */}
                    <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: primaryTextColor }}>
                            Affiliate Management
                        </h1>
                        <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                            Manage affiliate registrations and status
                        </p>
                    </div>

                    {/* Analytics Cards */}
                    {analytics && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-base-100 rounded-lg shadow-sm border p-4" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="text-sm opacity-70" style={{ color: secondaryTextColor }}>Total Affiliates</div>
                                <div className="text-2xl font-bold mt-1" style={{ color: primaryTextColor }}>
                                    {analytics.affiliates?.total || 0}
                                </div>
                            </div>
                            <div className="bg-base-100 rounded-lg shadow-sm border p-4" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="text-sm opacity-70" style={{ color: secondaryTextColor }}>Active</div>
                                <div className="text-2xl font-bold mt-1" style={{ color: successColor || '#6B8E6B' }}>
                                    {analytics.affiliates?.active || 0}
                                </div>
                            </div>
                            <div className="bg-base-100 rounded-lg shadow-sm border p-4" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="text-sm opacity-70" style={{ color: secondaryTextColor }}>Pending</div>
                                <div className="text-2xl font-bold mt-1" style={{ color: warningColor || '#F59E0B' }}>
                                    {analytics.affiliates?.pending || 0}
                                </div>
                            </div>
                            <div className="bg-base-100 rounded-lg shadow-sm border p-4" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="text-sm opacity-70" style={{ color: secondaryTextColor }}>Total Commission</div>
                                <div className="text-2xl font-bold mt-1" style={{ color: primaryTextColor }}>
                                    ৳{analytics.commissions?.total?.toLocaleString() || 0}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Requests Alert */}
                    {pendingCount > 0 ? (
                        <div className="rounded-lg shadow-sm border-2 p-4" style={{ borderColor: warningColor || '#F59E0B', backgroundColor: warningColor ? warningColor + '20' : '#fef3c7' }}>
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: warningColor || '#F59E0B' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm sm:text-base" style={{ color: primaryTextColor }}>
                                        {pendingCount} Pending Affiliate Request{pendingCount > 1 ? 's' : ''}
                                    </h3>
                                    <p className="text-xs sm:text-sm mt-1" style={{ color: secondaryTextColor }}>
                                        Review and approve affiliate registrations
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleStatusFilter('pending')}
                                    className="btn btn-sm px-3 py-2 text-xs sm:text-sm font-medium text-white"
                                    style={{ backgroundColor: warningColor || '#F59E0B', minHeight: '36px' }}
                                >
                                    View Pending
                                </button>
                            </div>
                        </div>
                    ) : !isLoading && filters.status !== 'pending' && (
                        <div className="rounded-lg shadow-sm border-2 p-4" style={{ borderColor: infoColor || '#3b82f6', backgroundColor: infoColor ? infoColor + '20' : '#dbeafe' }}>
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: infoColor || '#3b82f6' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm sm:text-base mb-1" style={{ color: primaryTextColor }}>
                                        Affiliate Request Management
                                    </h3>
                                    <p className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                        This page shows all affiliate registrations. When users request to become affiliates from their dashboard, their requests will appear here with "Pending" status. Click the "Pending" filter button to see new requests that need approval.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-base-100 rounded-lg shadow-sm border p-4" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or referral code..."
                                    value={filters.search}
                                    onChange={handleSearch}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 text-sm sm:text-base"
                                    style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor, minHeight: '44px' }}
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => handleStatusFilter('')}
                                    className={`btn btn-sm px-3 sm:px-4 py-2 text-xs sm:text-sm ${filters.status === '' ? 'text-white' : ''}`}
                                    style={filters.status === '' ? { backgroundColor: buttonColor, minHeight: '44px' } : { backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, minHeight: '44px' }}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('pending')}
                                    className={`btn btn-sm px-3 sm:px-4 py-2 text-xs sm:text-sm ${filters.status === 'pending' ? 'text-white' : ''}`}
                                    style={filters.status === 'pending' ? { backgroundColor: warningColor || '#F59E0B', minHeight: '44px' } : { backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, minHeight: '44px' }}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('active')}
                                    className={`btn btn-sm px-3 sm:px-4 py-2 text-xs sm:text-sm ${filters.status === 'active' ? 'text-white' : ''}`}
                                    style={filters.status === 'active' ? { backgroundColor: buttonColor, minHeight: '44px' } : { backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, minHeight: '44px' }}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('suspended')}
                                    className={`btn btn-sm px-3 sm:px-4 py-2 text-xs sm:text-sm ${filters.status === 'suspended' ? 'text-white' : ''}`}
                                    style={filters.status === 'suspended' ? { backgroundColor: errorColor || '#EF4444', minHeight: '44px' } : { backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, minHeight: '44px' }}
                                >
                                    Suspended
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('rejected')}
                                    className={`btn btn-sm px-3 sm:px-4 py-2 text-xs sm:text-sm ${filters.status === 'rejected' ? 'text-white' : ''}`}
                                    style={filters.status === 'rejected' ? { backgroundColor: errorColor || '#991B1B', minHeight: '44px' } : { backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, minHeight: '44px' }}
                                >
                                    Rejected
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Affiliates Table or Empty State */}
                    {isLoading && affiliates.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loading />
                        </div>
                    ) : affiliates.length === 0 ? (
                        <div className="bg-base-100 rounded-lg shadow-sm border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                    <svg className="w-10 h-10 sm:w-12 sm:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: secondaryTextColor }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: primaryTextColor }}>
                                        No Affiliates Found
                                    </h3>
                                    <p className="text-sm sm:text-base opacity-70 px-4 mb-4" style={{ color: secondaryTextColor }}>
                                        {filters.status ? `No affiliates with status "${filters.status}"` : 'No affiliates have been registered yet.'}
                                    </p>
                                    {filters.status === 'pending' && (
                                        <div className="rounded-lg p-4 max-w-md border" style={{ borderColor: warningColor || '#F59E0B', backgroundColor: warningColor ? warningColor + '20' : '#fef3c7' }}>
                                            <p className="text-sm" style={{ color: warningColor || '#92400e' }}>
                                                <strong>Note:</strong> Users who request to become affiliates will appear here with "Pending" status. Check if any users have submitted affiliate registration requests.
                                            </p>
                                        </div>
                                    )}
                                    {!filters.status && (
                                        <div className="rounded-lg p-4 max-w-md border" style={{ borderColor: infoColor || '#3b82f6', backgroundColor: infoColor ? infoColor + '20' : '#dbeafe' }}>
                                            <p className="text-sm" style={{ color: infoColor || '#1e40af' }}>
                                                <strong>Tip:</strong> When users register as affiliates from their dashboard, their requests will appear here. You can filter by "Pending" status to see new requests.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Affiliates Table */}
                            <div className="bg-base-100 rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr style={{ backgroundColor: buttonColor }}>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>User</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Referral Code</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Status</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Payment Method</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Stats</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Registered</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {affiliates.map((affiliate) => (
                                                <tr key={affiliate.id} className="transition-colors border-b" style={{ borderColor: secondaryTextColor }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <td className="py-3 px-4">
                                                        <div>
                                                            <div className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                                                {affiliate.user?.name || affiliate.user?.id || 'N/A'}
                                                            </div>
                                                            <div className="text-xs opacity-70" style={{ color: secondaryTextColor }}>
                                                                {affiliate.user?.email || affiliate.user?.mobile || '-'}
                                                            </div>
                                                            {affiliate.user?.mobile && affiliate.user?.email && (
                                                                <div className="text-xs opacity-50 mt-0.5" style={{ color: secondaryTextColor }}>
                                                                    {affiliate.user.mobile}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-mono text-sm font-medium" style={{ color: buttonColor }}>
                                                            {affiliate.referralCode || '-'}
                                                        </div>
                                                        {affiliate.referralLink && (
                                                            <div className="text-xs opacity-70 mt-1 break-all" style={{ color: secondaryTextColor }}>
                                                                {affiliate.referralLink.substring(0, 30)}...
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {getStatusBadge(affiliate.status)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-xs sm:text-sm" style={{ color: primaryTextColor }}>
                                                            {affiliate.paymentMethod === 'mobile_banking' ? (
                                                                <div>
                                                                    <div className="font-medium" style={{ color: primaryTextColor }}>Mobile Banking</div>
                                                                    {affiliate.mobileBanking && (
                                                                        <div className="text-xs opacity-70 mt-1" style={{ color: secondaryTextColor }}>
                                                                            {affiliate.mobileBanking.provider?.toUpperCase()}: {affiliate.mobileBanking.accountNumber}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : affiliate.paymentMethod === 'bank' ? (
                                                                <div>
                                                                    <div className="font-medium" style={{ color: primaryTextColor }}>Bank Transfer</div>
                                                                    {affiliate.bankDetails && (
                                                                        <div className="text-xs opacity-70 mt-1" style={{ color: secondaryTextColor }}>
                                                                            {affiliate.bankDetails.bankName} - {affiliate.bankDetails.accountNumber}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                affiliate.paymentMethod || '-'
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-xs" style={{ color: secondaryTextColor }}>
                                                            <div>Refs: {affiliate.totalReferrals || 0}</div>
                                                            <div>Sales: ৳{affiliate.totalSales?.toLocaleString() || 0}</div>
                                                            <div>Commission: ৳{affiliate.totalCommission?.toLocaleString() || 0}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                            {affiliate.createdAt ? formatDate(affiliate.createdAt) : '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col gap-1">
                                                            {affiliate.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(affiliate.id)}
                                                                        disabled={actionLoading === affiliate.id}
                                                                        className="btn btn-xs px-2 py-1 text-xs font-medium text-white"
                                                                        style={{ backgroundColor: buttonColor, minHeight: '28px' }}
                                                                    >
                                                                        {actionLoading === affiliate.id ? '...' : 'Approve'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setRejectModal({ open: true, affiliateId: affiliate.id, reason: '' })}
                                                                        disabled={actionLoading === affiliate.id}
                                                                        className="btn btn-xs px-2 py-1 text-xs font-medium"
                                                                        style={{ backgroundColor: errorColor || '#EF4444', color: '#ffffff', minHeight: '28px' }}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            {affiliate.status === 'active' && (
                                                                <button
                                                                    onClick={() => handleSuspend(affiliate.id)}
                                                                    disabled={actionLoading === affiliate.id}
                                                                    className="btn btn-xs px-2 py-1 text-xs font-medium"
                                                                    style={{ backgroundColor: errorColor || '#EF4444', color: '#ffffff', minHeight: '28px' }}
                                                                >
                                                                    {actionLoading === affiliate.id ? '...' : 'Suspend'}
                                                                </button>
                                                            )}
                                                            {affiliate.status === 'suspended' && (
                                                                <button
                                                                    onClick={() => handleApprove(affiliate.id)}
                                                                    disabled={actionLoading === affiliate.id}
                                                                    className="btn btn-xs px-2 py-1 text-xs font-medium text-white"
                                                                    style={{ backgroundColor: buttonColor, minHeight: '28px' }}
                                                                >
                                                                    {actionLoading === affiliate.id ? '...' : 'Reactivate'}
                                                                </button>
                                                            )}
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
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    totalItems={pagination.totalItems}
                                    itemsPerPage={pagination.itemsPerPage}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md" style={{ backgroundColor }}>
                        <h3 className="text-lg font-bold mb-4" style={{ color: primaryTextColor }}>Reject Affiliate</h3>
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text font-medium" style={{ color: primaryTextColor }}>
                                    Rejection Reason <span className="text-error">*</span>
                                </span>
                            </label>
                            <textarea
                                value={rejectModal.reason}
                                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                                className="textarea textarea-bordered w-full"
                                style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor, minHeight: '100px' }}
                                placeholder="Enter reason for rejection..."
                            />
                        </div>
                        <div className="modal-action">
                            <button
                                onClick={() => setRejectModal({ open: false, affiliateId: null, reason: '' })}
                                className="btn"
                                style={{ backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading === rejectModal.affiliateId}
                                className="btn text-white"
                                style={{ backgroundColor: errorColor || '#EF4444', minHeight: '44px' }}
                            >
                                {actionLoading === rejectModal.affiliateId ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AffiliateList;

