/**
 * Admin User List Page
 * 
 * List all users with ban, make admin, and remove admin functionality
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllUsers, updateUserRole, updateUserStatus } from '../../../services/adminService';
import Loading from '../../../components/common/Loading';
import Pagination from '../../../components/common/Pagination';
import { formatDate } from '../../../utils/helpers';

function UserList() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchUsers();
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
        if (!window.confirm(isActive ? 'Are you sure you want to unban this user?' : 'Are you sure you want to ban this user?')) {
            return;
        }

        setActionLoading(userId);
        try {
            await updateUserStatus(userId, isActive);
            await fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || error.message || 'Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        const action = newRole === 'admin' ? 'make admin' : 'remove admin';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        setActionLoading(userId);
        try {
            await updateUserRole(userId, newRole);
            await fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || error.message || 'Failed to update user role');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                <div className="space-y-5 sm:space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: '#e2e8f0' }}>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#1E293B' }}>
                            {t('nav.userManagement') || 'User Management'}
                        </h1>
                        <p className="text-sm opacity-70" style={{ color: '#64748b' }}>
                            Manage all users, roles, and permissions
                        </p>
                    </div>

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
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: '#f1f5f9' }}>
                                    <svg
                                        className="w-10 h-10 sm:w-12 sm:h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ color: '#94a3b8' }}
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
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: '#1E293B' }}>
                                        No Users Found
                                    </h3>
                                    <p className="text-sm sm:text-base opacity-70 px-4" style={{ color: '#64748b' }}>
                                        No users have been registered yet.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Users Table */}
                            <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr style={{ backgroundColor: '#6B8E6B' }}>
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
                                                <tr key={user.id || user._id} className="hover:bg-gray-50 transition-colors border-b" style={{ borderColor: '#e2e8f0' }}>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm font-medium" style={{ color: '#1E293B' }}>
                                                            {user.profile?.name || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm" style={{ color: '#1E293B' }}>
                                                            {user.profile?.email || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm" style={{ color: '#1E293B' }}>
                                                            {user.mobile || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className="badge badge-xs px-2 py-0.5 font-medium"
                                                            style={user.role === 'admin' ? { backgroundColor: '#6B8E6B', color: '#ffffff', border: 'none' } : { backgroundColor: '#64748b', color: '#ffffff', border: 'none' }}
                                                        >
                                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`badge badge-xs px-2 py-0.5 font-medium ${user.isVerified !== false ? 'badge-success' : 'badge-error'}`}
                                                            style={user.isVerified !== false ? { backgroundColor: '#d1fae5', color: '#065f46', border: 'none' } : { backgroundColor: '#fee2e2', color: '#991b1b', border: 'none' }}
                                                        >
                                                            {user.isVerified !== false ? 'Active' : 'Banned'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-xs" style={{ color: '#64748b' }}>
                                                            {formatDate(user.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            {user.role !== 'admin' ? (
                                                                <button
                                                                    onClick={() => handleUpdateRole(user.id || user._id, 'admin')}
                                                                    className="btn btn-xs text-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-sm flex-1 sm:flex-initial"
                                                                    style={{ backgroundColor: '#1E293B', paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
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
                                                                    style={{ backgroundColor: '#ef4444', paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
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
                                                                    backgroundColor: user.isVerified !== false ? '#ef4444' : '#6B8E6B',
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
        </div>
    );
}

export default UserList;

