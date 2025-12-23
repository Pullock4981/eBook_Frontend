/**
 * Admin User List Page
 * 
 * List all users with ban, make admin, and remove admin functionality
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, updateUserRole, updateUserStatus } from '../../../services/adminService';
import { getAllAffiliates, approveAffiliate, rejectAffiliate } from '../../../services/adminAffiliateService';
import Loading from '../../../components/common/Loading';
import Pagination from '../../../components/common/Pagination';
import { formatDate } from '../../../utils/helpers';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { showError, showSuccess } from '../../../utils/toast';
import Swal from 'sweetalert2';

function UserList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor, successColor, infoColor, warningColor } = useThemeColors();
    const [users, setUsers] = useState([]);
    const [affiliates, setAffiliates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAffiliates, setIsLoadingAffiliates] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, affiliateId: null, reason: '' });

    useEffect(() => {
        fetchUsers();
        fetchPendingAffiliates();
    }, [pagination.currentPage, pagination.itemsPerPage]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getAllUsers({
                page: pagination.currentPage,
                limit: pagination.itemsPerPage
            });

            if (response?.success && response?.data) {
                setUsers(response.data.users || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination?.totalPages || 1,
                    totalItems: response.data.pagination?.totalItems || 0
                }));
            } else {
                setUsers([]);
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch users');
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleItemsPerPageChange = (limit) => {
        setPagination(prev => ({ ...prev, currentPage: 1, itemsPerPage: limit }));
    };

    const handleBanUser = async (userId, isActive) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: isActive ? 'You want to unban this user?' : 'You want to ban this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: isActive ? 'Unban' : 'Ban',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setActionLoading(userId);
        try {
            await updateUserStatus(userId, isActive);
            showSuccess(isActive ? 'User unbanned successfully!' : 'User banned successfully!');
            await fetchUsers();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        const action = newRole === 'admin' ? 'make admin' : 'remove admin';
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to ${action} this user?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setActionLoading(userId);
        try {
            await updateUserRole(userId, newRole);
            showSuccess(`User role updated to ${newRole} successfully!`);
            await fetchUsers();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to update user role');
        } finally {
            setActionLoading(null);
        }
    };

    const fetchPendingAffiliates = async () => {
        try {
            setIsLoadingAffiliates(true);
            const response = await getAllAffiliates({ status: 'pending' }, 1, 5);

            // Handle response structure - getAllAffiliates service returns response.data from axios
            // Backend sends: { success: true, data: { affiliates: [...], pagination: {...} } }
            // Service returns: response.data (which is the backend response)
            let affiliatesList = [];

            if (response?.success && response?.data?.affiliates) {
                // Standard structure: response.data.affiliates
                affiliatesList = response.data.affiliates;
            } else if (response?.data?.affiliates) {
                // Alternative structure: response.data.affiliates (without success check)
                affiliatesList = response.data.affiliates;
            } else if (response?.affiliates) {
                // Direct affiliates array
                affiliatesList = response.affiliates;
            } else if (Array.isArray(response)) {
                // Response is directly an array
                affiliatesList = response;
            }

            setAffiliates(affiliatesList);
        } catch (error) {
            console.error('Error fetching pending affiliates:', error);
            setAffiliates([]);
        } finally {
            setIsLoadingAffiliates(false);
        }
    };

    const handleApproveAffiliate = async (affiliateId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You want to approve this affiliate request?',
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

        setActionLoading(`affiliate-${affiliateId}`);
        try {
            await approveAffiliate(affiliateId);
            showSuccess('Affiliate approved successfully!');
            await fetchPendingAffiliates();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to approve affiliate');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectAffiliate = async () => {
        if (!rejectModal.reason.trim()) {
            showError('Please provide a rejection reason');
            return;
        }

        setActionLoading(`affiliate-${rejectModal.affiliateId}`);
        try {
            await rejectAffiliate(rejectModal.affiliateId, rejectModal.reason);
            showSuccess('Affiliate rejected successfully!');
            setRejectModal({ open: false, affiliateId: null, reason: '' });
            await fetchPendingAffiliates();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to reject affiliate');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                <div className="space-y-5 sm:space-y-6">
                    {/* Header */}
                    <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: primaryTextColor }}>
                            {t('nav.userManagement') || 'User Management'}
                        </h1>
                        <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                            Manage all users, roles, and permissions
                        </p>
                    </div>

                    {/* Affiliate Requests Section */}
                    {isLoadingAffiliates ? (
                        <div className="bg-base-100 rounded-lg shadow-sm border p-4" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="text-center py-4">
                                <span className="loading loading-spinner loading-sm"></span>
                                <span className="ml-2 text-sm" style={{ color: secondaryTextColor }}>Loading affiliate requests...</span>
                            </div>
                        </div>
                    ) : affiliates.length > 0 ? (
                        <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: primaryTextColor }}>
                                        Pending Affiliate Requests
                                    </h2>
                                    <p className="text-xs sm:text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                        {affiliates.length} request{affiliates.length > 1 ? 's' : ''} waiting for approval
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/affiliates')}
                                    className="btn btn-sm px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white"
                                    style={{ backgroundColor: buttonColor, minHeight: '36px' }}
                                >
                                    View All
                                </button>
                            </div>
                            <div className="space-y-3">
                                {affiliates.map((affiliate) => (
                                    <div
                                        key={affiliate.id}
                                        className="border rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow"
                                        style={{ borderColor: secondaryTextColor, backgroundColor }}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                                        {affiliate.user?.name || 'N/A'}
                                                    </span>
                                                    <span className="badge badge-xs px-2 py-0.5" style={{ backgroundColor: warningColor ? warningColor + '40' : '#FEF3C7', color: warningColor || '#92400E', border: 'none' }}>
                                                        Pending
                                                    </span>
                                                </div>
                                                <div className="text-xs opacity-70" style={{ color: secondaryTextColor }}>
                                                    {affiliate.user?.email || affiliate.user?.mobile || '-'}
                                                </div>
                                                <div className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                                                    Referral Code: <span className="font-mono font-medium" style={{ color: buttonColor }}>{affiliate.referralCode || 'N/A'}</span>
                                                </div>
                                                {affiliate.paymentMethod && (
                                                    <div className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                                                        Payment: {affiliate.paymentMethod === 'mobile_banking' ? 'Mobile Banking' : affiliate.paymentMethod === 'bank' ? 'Bank Transfer' : affiliate.paymentMethod}
                                                        {affiliate.mobileBanking && (
                                                            <span className="ml-1">
                                                                ({affiliate.mobileBanking.provider?.toUpperCase()}: {affiliate.mobileBanking.accountNumber})
                                                            </span>
                                                        )}
                                                        {affiliate.bankDetails && (
                                                            <span className="ml-1">
                                                                ({affiliate.bankDetails.bankName} - {affiliate.bankDetails.accountNumber})
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleApproveAffiliate(affiliate.id)}
                                                    disabled={actionLoading === `affiliate-${affiliate.id}`}
                                                    className="btn btn-xs px-2 sm:px-3 py-1.5 text-xs font-medium text-white"
                                                    style={{ backgroundColor: buttonColor, minHeight: '32px' }}
                                                >
                                                    {actionLoading === `affiliate-${affiliate.id}` ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal({ open: true, affiliateId: affiliate.id, reason: '' })}
                                                    disabled={actionLoading === `affiliate-${affiliate.id}`}
                                                    className="btn btn-xs px-2 sm:px-3 py-1.5 text-xs font-medium"
                                                    style={{ backgroundColor: errorColor || '#EF4444', color: '#ffffff', minHeight: '32px' }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg p-4 border" style={{ borderColor: infoColor || '#3b82f6', backgroundColor: infoColor ? infoColor + '20' : '#dbeafe' }}>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: infoColor || '#3b82f6' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                        No Pending Affiliate Requests
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                                        All affiliate requests have been processed. Check the <button onClick={() => navigate('/admin/affiliates')} className="underline font-medium" style={{ color: buttonColor }}>Affiliate Management</button> page for all affiliates.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Users Table or Empty State */}
                    {isLoading && users.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loading />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="bg-base-100 rounded-lg shadow-sm border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                    <svg
                                        className="w-10 h-10 sm:w-12 sm:h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ color: secondaryTextColor }}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: primaryTextColor }}>
                                        No Users Found
                                    </h3>
                                    <p className="text-sm sm:text-base opacity-70 px-4" style={{ color: secondaryTextColor }}>
                                        No users have been registered yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Users Table */}
                            <div className="bg-base-100 rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr style={{ backgroundColor: buttonColor }}>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Name</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Email</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Mobile</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Role</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Status</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Joined</th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id || user._id} className="transition-colors border-b" style={{ borderColor: secondaryTextColor }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                                            {user.profile?.name || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm" style={{ color: primaryTextColor }}>
                                                            {user.profile?.email || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm" style={{ color: primaryTextColor }}>
                                                            {user.mobile || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className="badge badge-xs px-2 py-0.5 font-medium"
                                                            style={user.role === 'admin' ? { backgroundColor: buttonColor, color: '#ffffff', border: 'none' } : { backgroundColor: secondaryTextColor, color: '#ffffff', border: 'none' }}
                                                        >
                                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`badge badge-xs px-2 py-0.5 font-medium ${user.isVerified !== false ? 'badge-success' : 'badge-error'}`}
                                                            style={user.isVerified !== false ? { backgroundColor: successColor ? successColor + '40' : '#d1fae5', color: successColor || '#065f46', border: 'none' } : { backgroundColor: errorColor ? errorColor + '40' : '#fee2e2', color: errorColor || '#991b1b', border: 'none' }}
                                                        >
                                                            {user.isVerified !== false ? 'Active' : 'Banned'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-xs" style={{ color: secondaryTextColor }}>
                                                            {formatDate(user.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            {user.role !== 'admin' ? (
                                                                <button
                                                                    onClick={() => handleUpdateRole(user.id || user._id, 'admin')}
                                                                    className="btn btn-xs text-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-sm flex-1 sm:flex-initial"
                                                                    style={{ backgroundColor: buttonColor, paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                                                                    disabled={actionLoading === (user.id || user._id)}
                                                                >
                                                                    {actionLoading === (user.id || user._id) ? (
                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                    ) : (
                                                                        <span className="whitespace-nowrap">Make Admin</span>
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleUpdateRole(user.id || user._id, 'user')}
                                                                    className="btn btn-xs text-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-sm flex-1 sm:flex-initial"
                                                                    style={{ backgroundColor: errorColor || '#ef4444', paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                                                                    disabled={actionLoading === (user.id || user._id)}
                                                                >
                                                                    {actionLoading === (user.id || user._id) ? (
                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                    ) : (
                                                                        <span className="whitespace-nowrap">Remove Admin</span>
                                                                    )}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleBanUser(user.id || user._id, user.isVerified !== false)}
                                                                className="btn btn-xs text-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-sm flex-1 sm:flex-initial"
                                                                style={{
                                                                    backgroundColor: user.isVerified !== false ? (errorColor || '#ef4444') : buttonColor,
                                                                    paddingLeft: '0.5rem',
                                                                    paddingRight: '0.5rem',
                                                                    paddingTop: '0.375rem',
                                                                    paddingBottom: '0.375rem'
                                                                }}
                                                                disabled={actionLoading === (user.id || user._id)}
                                                            >
                                                                {actionLoading === (user.id || user._id) ? (
                                                                    <span className="loading loading-spinner loading-xs"></span>
                                                                ) : (
                                                                    <span className="whitespace-nowrap">{user.isVerified !== false ? 'Ban' : 'Unban'}</span>
                                                                )}
                                                            </button>
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

            {/* Reject Affiliate Modal */}
            {rejectModal.open && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md" style={{ backgroundColor }}>
                        <h3 className="text-lg font-bold mb-4" style={{ color: primaryTextColor }}>Reject Affiliate Request</h3>
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
                                onClick={handleRejectAffiliate}
                                disabled={actionLoading === `affiliate-${rejectModal.affiliateId}`}
                                className="btn text-white"
                                style={{ backgroundColor: errorColor || '#EF4444', minHeight: '44px' }}
                            >
                                {actionLoading === `affiliate-${rejectModal.affiliateId}` ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserList;

