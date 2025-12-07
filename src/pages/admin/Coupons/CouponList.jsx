/**
 * Admin Coupon List Page
 * 
 * List all coupons with search, filters, and actions
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllCoupons, deleteCoupon, selectCoupons, selectCouponPagination, selectCouponLoading, selectCouponError } from '../../../store/slices/couponSlice';
import { formatCurrency } from '../../../utils/helpers';
import Loading from '../../../components/common/Loading';
import Pagination from '../../../components/common/Pagination';

function CouponList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const coupons = useSelector(selectCoupons);
    const pagination = useSelector(selectCouponPagination);
    const isLoading = useSelector(selectCouponLoading);
    const error = useSelector(selectCouponError);

    const [searchQuery, setSearchQuery] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        dispatch(fetchAllCoupons({ page: 1, limit: 10 }));
    }, [dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(fetchAllCoupons({ page: 1, limit: 10, filters: { search: searchQuery } }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.confirmDeleteCoupon') || 'Are you sure you want to delete this coupon?')) {
            return;
        }

        setDeleteLoading(id);
        try {
            await dispatch(deleteCoupon(id)).unwrap();
            // Refresh list
            dispatch(fetchAllCoupons({ page: pagination.currentPage, limit: 10 }));
        } catch (error) {
            alert(error || t('admin.deleteError') || 'Failed to delete coupon');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handlePageChange = (page) => {
        dispatch(fetchAllCoupons({ page, limit: 10 }));
    };

    const getStatusBadge = (coupon) => {
        const now = new Date();
        const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < now;
        const isUsageLimitReached = coupon.usedCount >= coupon.usageLimit;
        const isActive = coupon.isActive && !isExpired && !isUsageLimitReached;

        if (!isActive) {
            return (
                <span className="badge badge-error badge-sm">
                    {isExpired ? t('admin.expired') || 'Expired' : isUsageLimitReached ? t('admin.usageLimitReached') || 'Limit Reached' : t('admin.inactive') || 'Inactive'}
                </span>
            );
        }
        return <span className="badge badge-success badge-sm">{t('admin.active') || 'Active'}</span>;
    };

    const getDiscountDisplay = (coupon) => {
        if (coupon.type === 'percentage') {
            return `${coupon.value}%${coupon.maxDiscount ? ` (Max ${formatCurrency(coupon.maxDiscount)})` : ''}`;
        }
        return formatCurrency(coupon.value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-row justify-between items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate" style={{ color: '#1E293B' }}>
                        {t('admin.coupons') || 'Coupons'}
                    </h1>
                    <p className="text-xs sm:text-sm opacity-70 mt-0.5 sm:mt-1 hidden sm:block" style={{ color: '#2d3748' }}>
                        {t('admin.manageCoupons') || 'Manage all discount coupons'}
                    </p>
                </div>
                <Link
                    to="/admin/coupons/create"
                    className="btn btn-primary text-white btn-sm sm:btn-md flex-shrink-0"
                    style={{ backgroundColor: '#1E293B' }}
                >
                    <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <span>{t('admin.addCoupon') || 'Add Coupon'}</span>
                </Link>
            </div>

            {/* Search */}
            <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                <div className="card-body p-3 sm:p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            placeholder={t('admin.searchCoupons') || 'Search coupons...'}
                            className="input input-bordered flex-grow border-2 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ borderColor: '#cbd5e1', color: '#1E293B' }}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary text-white btn-sm sm:btn-md"
                            style={{ backgroundColor: '#1E293B' }}
                        >
                            {t('common.search') || 'Search'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Loading State */}
            {isLoading && coupons.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                    <Loading />
                </div>
            ) : coupons.length === 0 ? (
                /* Empty State */
                <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f1f5f9' }}>
                            <svg
                                className="w-10 h-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: '#94a3b8' }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E293B' }}>
                            {t('admin.noCoupons') || 'No Coupons Found'}
                        </h3>
                        <p className="text-sm opacity-70 mb-4 text-center" style={{ color: '#2d3748' }}>
                            {t('admin.noCouponsDescription') || 'Create your first coupon to get started!'}
                        </p>
                        <Link
                            to="/admin/coupons/create"
                            className="btn btn-primary text-white btn-sm"
                            style={{ backgroundColor: '#1E293B' }}
                        >
                            {t('admin.addCoupon') || 'Add Coupon'}
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Mobile Card View - Small Devices */}
                    <div className="block md:hidden space-y-3 sm:space-y-4">
                        {coupons.map((coupon) => (
                            <div
                                key={coupon._id}
                                className="card bg-base-100 shadow-sm border-2"
                                style={{ borderColor: '#e2e8f0' }}
                            >
                                <div className="card-body p-4 space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-base sm:text-lg mb-1" style={{ color: '#1E293B' }}>
                                                {coupon.code}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="badge badge-info badge-sm">
                                                    {coupon.type === 'percentage' ? t('admin.percentage') || 'Percentage' : t('admin.fixed') || 'Fixed'}
                                                </span>
                                                {getStatusBadge(coupon)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 border-t border-b py-3" style={{ borderColor: '#e2e8f0' }}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                                                {t('admin.discount') || 'Discount'}:
                                            </span>
                                            <span className="font-semibold text-sm" style={{ color: '#1E293B' }}>
                                                {getDiscountDisplay(coupon)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                                                {t('admin.usage') || 'Usage'}:
                                            </span>
                                            <span className="text-sm" style={{ color: '#2d3748' }}>
                                                {coupon.usedCount || 0} / {coupon.usageLimit}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm opacity-70" style={{ color: '#2d3748' }}>
                                                {t('admin.expiry') || 'Expiry'}:
                                            </span>
                                            <span className="text-sm" style={{ color: '#2d3748' }}>
                                                {coupon.expiryDate
                                                    ? new Date(coupon.expiryDate).toLocaleDateString()
                                                    : t('admin.noExpiry') || 'No Expiry'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row gap-2 pt-2">
                                        <Link
                                            to={`/admin/coupons/edit/${coupon._id}`}
                                            className="btn btn-sm text-white flex-1 flex items-center justify-center gap-2"
                                            style={{ backgroundColor: '#1E293B' }}
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            <span className="text-xs sm:text-sm font-medium">{t('common.edit') || 'Edit'}</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="btn btn-sm text-white flex-1 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                                            style={{
                                                backgroundColor: '#ef4444',
                                                borderColor: '#ef4444'
                                            }}
                                            disabled={deleteLoading === coupon._id}
                                        >
                                            {deleteLoading === coupon._id ? (
                                                <span className="loading loading-spinner loading-xs"></span>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                    <span className="text-xs sm:text-sm font-medium">{t('common.delete') || 'Delete'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View - Large Devices */}
                    <div className="hidden md:block card bg-base-100 shadow-sm border-2 overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc' }}>
                                        <th className="px-4 py-3 text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                            {t('admin.code') || 'Code'}
                                        </th>
                                        <th className="px-4 py-3 text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                            {t('admin.type') || 'Type'}
                                        </th>
                                        <th className="px-4 py-3 text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                            {t('admin.discount') || 'Discount'}
                                        </th>
                                        <th className="px-4 py-3 text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                            {t('admin.usage') || 'Usage'}
                                        </th>
                                        <th className="px-4 py-3 text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                            {t('admin.status') || 'Status'}
                                        </th>
                                        <th className="px-4 py-3 text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                            {t('admin.expiry') || 'Expiry'}
                                        </th>
                                        <th className="px-4 py-3 text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                            {t('common.actions') || 'Actions'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map((coupon) => (
                                        <tr key={coupon._id} className="hover">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                                    {coupon.code}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="badge badge-info badge-sm sm:badge-md">
                                                    {coupon.type === 'percentage' ? t('admin.percentage') || 'Percentage' : t('admin.fixed') || 'Fixed'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                                    {getDiscountDisplay(coupon)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs sm:text-sm" style={{ color: '#2d3748' }}>
                                                    {coupon.usedCount || 0} / {coupon.usageLimit}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{getStatusBadge(coupon)}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs sm:text-sm" style={{ color: '#2d3748' }}>
                                                    {coupon.expiryDate
                                                        ? new Date(coupon.expiryDate).toLocaleDateString()
                                                        : t('admin.noExpiry') || 'No Expiry'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-row gap-2">
                                                    <Link
                                                        to={`/admin/coupons/edit/${coupon._id}`}
                                                        className="btn btn-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md transition-all"
                                                        style={{ backgroundColor: '#1E293B' }}
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                        <span className="text-xs sm:text-sm font-medium">{t('common.edit') || 'Edit'}</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(coupon._id)}
                                                        className="btn btn-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md transition-all"
                                                        style={{
                                                            backgroundColor: '#ef4444',
                                                            borderColor: '#ef4444'
                                                        }}
                                                        disabled={deleteLoading === coupon._id}
                                                    >
                                                        {deleteLoading === coupon._id ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ) : (
                                                            <>
                                                                <svg
                                                                    className="w-4 h-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                                <span className="text-xs sm:text-sm font-medium">{t('common.delete') || 'Delete'}</span>
                                                            </>
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
                        <div className="p-4 border-t" style={{ borderColor: '#e2e8f0' }}>
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CouponList;

