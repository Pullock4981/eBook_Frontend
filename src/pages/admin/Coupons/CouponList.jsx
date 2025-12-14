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
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getPendingAffiliateCoupons, approveAffiliateCoupon, rejectAffiliateCoupon } from '../../../services/couponService';
import toast from 'react-hot-toast';

function CouponList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor, successColor } = useThemeColors();

    const coupons = useSelector(selectCoupons);
    const pagination = useSelector(selectCouponPagination);
    const isLoading = useSelector(selectCouponLoading);
    const error = useSelector(selectCouponError);

    const [searchQuery, setSearchQuery] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [pendingCoupons, setPendingCoupons] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        console.log('📄 CouponList component mounted');
        dispatch(fetchAllCoupons({ page: 1, limit: 10 }));
        loadPendingCoupons();
    }, [dispatch]);

    const loadPendingCoupons = async () => {
        setPendingLoading(true);
        try {
            console.log('🔄 Loading pending affiliate coupons...');
            const response = await getPendingAffiliateCoupons(1, 10);
            console.log('✅ Pending coupons - Raw response:', response);
            console.log('✅ Pending coupons - Response type:', typeof response);
            console.log('✅ Pending coupons - Response keys:', response ? Object.keys(response) : 'null');
            console.log('✅ Pending coupons - Full JSON:', JSON.stringify(response, null, 2));
            
            // API interceptor returns response.data directly
            // Backend returns: { success: true, data: { coupons: [...], pagination: {...} } }
            // After interceptor: response = { success: true, data: { coupons: [...], pagination: {...} } }
            
            let couponsList = [];
            
            // Direct check: response.data.coupons (most likely structure)
            if (response?.data?.coupons) {
                couponsList = Array.isArray(response.data.coupons) ? response.data.coupons : [];
                console.log('✅ Found in response.data.coupons:', couponsList.length);
            }
            // Fallback: response.success && response.data.coupons
            else if (response?.success && response?.data?.coupons) {
                couponsList = Array.isArray(response.data.coupons) ? response.data.coupons : [];
                console.log('✅ Found in response.data.coupons (with success):', couponsList.length);
            }
            // Fallback: nested data.data.coupons
            else if (response?.data?.data?.coupons) {
                couponsList = Array.isArray(response.data.data.coupons) ? response.data.data.coupons : [];
                console.log('✅ Found in response.data.data.coupons:', couponsList.length);
            }
            // Fallback: response.coupons
            else if (response?.coupons) {
                couponsList = Array.isArray(response.coupons) ? response.coupons : [];
                console.log('✅ Found in response.coupons:', couponsList.length);
            }
            // Fallback: response.data is array
            else if (Array.isArray(response?.data)) {
                couponsList = response.data;
                console.log('✅ Found as array in response.data:', couponsList.length);
            }
            // Last fallback: response is array
            else if (Array.isArray(response)) {
                couponsList = response;
                console.log('✅ Found as direct array:', couponsList.length);
            }
            else {
                console.warn('⚠️ No coupons found. Full response:', JSON.stringify(response, null, 2));
            }
            
            console.log('📋 Pending coupons - Final list:', couponsList);
            console.log('📊 Pending coupons - Count:', couponsList.length);
            
            setPendingCoupons(couponsList || []);
        } catch (error) {
            console.error('❌ Error loading pending coupons:', error);
            console.error('❌ Error response:', error?.response);
            console.error('❌ Error data:', error?.response?.data);
            console.error('❌ Error message:', error?.message);
            console.error('❌ Error stack:', error?.stack);
            setPendingCoupons([]);
        } finally {
            setPendingLoading(false);
        }
    };

    const handleApprove = async (couponId) => {
        setActionLoading(couponId);
        try {
            console.log('Approving coupon:', couponId);
            const response = await approveAffiliateCoupon(couponId);
            console.log('Approve response:', response);
            
            // Handle different response structures
            const success = response?.success || response?.data?.success;
            if (success) {
                toast.success('Coupon Approved! The affiliate coupon has been approved and is now active.');
                // Reload pending coupons and all coupons
                await loadPendingCoupons();
                dispatch(fetchAllCoupons({ page: 1, limit: 10 }));
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Approve error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to approve coupon';
            toast.error(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (couponId) => {
        if (!window.confirm('Are you sure you want to reject this coupon request? This action cannot be undone.')) {
            return;
        }

        setActionLoading(couponId);
        try {
            console.log('Rejecting coupon:', couponId);
            const response = await rejectAffiliateCoupon(couponId);
            console.log('Reject response:', response);
            
            // Handle different response structures
            const success = response?.success || response?.data?.success;
            if (success) {
                toast.success('Coupon Rejected! The affiliate coupon request has been rejected.');
                // Reload pending coupons and all coupons
                await loadPendingCoupons();
                dispatch(fetchAllCoupons({ page: 1, limit: 10 }));
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Reject error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reject coupon';
            toast.error(errorMessage);
        } finally {
            setActionLoading(null);
        }
    };

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
                <span
                    className="badge badge-xs px-2 py-0.5 font-medium"
                    style={{
                        backgroundColor: isExpired ? '#fee2e2' : '#fee2e2',
                        color: isExpired ? '#991b1b' : '#991b1b',
                        border: 'none'
                    }}
                >
                    {isExpired ? t('admin.expired') || 'Expired' : isUsageLimitReached ? t('admin.usageLimitReached') || 'Limit Reached' : t('admin.inactive') || 'Inactive'}
                </span>
            );
        }
        return (
            <span
                className="badge badge-xs px-2 py-0.5 font-medium"
                style={{ backgroundColor: '#d1fae5', color: '#065f46', border: 'none' }}
            >
                {t('admin.active') || 'Active'}
            </span>
        );
    };

    const getDiscountDisplay = (coupon) => {
        if (coupon.type === 'percentage') {
            return `${coupon.value}%${coupon.maxDiscount ? ` (Max ${formatCurrency(coupon.maxDiscount)})` : ''}`;
        }
        return formatCurrency(coupon.value);
    };

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                <div className="space-y-5 sm:space-y-6">
                    {/* Header */}
                    <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: primaryTextColor }}>
                                    {t('admin.coupons') || 'Coupons'}
                                </h1>
                                <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                    {t('admin.manageCoupons') || 'Manage all discount coupons'}
                                </p>
                            </div>
                            <Link
                                to="/admin/coupons/create"
                                className="btn btn-primary text-white btn-sm sm:btn-md flex-shrink-0 px-4 py-2.5 font-medium transition-all duration-200 hover:shadow-md"
                                style={{ backgroundColor: buttonColor, paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
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
                                <span className="ml-1.5">{t('admin.addCoupon') || '+ Add Coupon'}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Pending Affiliate Coupon Requests */}
                    <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold mb-1" style={{ color: primaryTextColor }}>
                                    Pending Affiliate Coupon Requests
                                </h2>
                                <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                    {pendingLoading ? 'Loading...' : `${pendingCoupons.length} coupon request${pendingCoupons.length !== 1 ? 's' : ''} waiting for approval`}
                                </p>
                            </div>
                        </div>
                        {pendingLoading ? (
                            <div className="flex justify-center py-8">
                                <Loading />
                            </div>
                        ) : pendingCoupons.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                    No pending coupon requests at the moment.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingCoupons.map((coupon) => (
                                        <div
                                            key={coupon.id || coupon._id}
                                            className="border rounded-lg p-4"
                                            style={{ borderColor: secondaryTextColor, backgroundColor }}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="font-bold text-lg font-mono" style={{ color: successColor }}>
                                                            {coupon.code}
                                                        </span>
                                                        <span className="badge badge-warning">Pending</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                                        <div>
                                                            <span style={{ color: secondaryTextColor }}>Type: </span>
                                                            <span style={{ color: primaryTextColor }}>{coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: secondaryTextColor }}>Discount: </span>
                                                            <span style={{ color: primaryTextColor }}>
                                                                {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: secondaryTextColor }}>Usage Limit: </span>
                                                            <span style={{ color: primaryTextColor }}>{coupon.usageLimit}</span>
                                                        </div>
                                                        {coupon.minPurchase > 0 && (
                                                            <div>
                                                                <span style={{ color: secondaryTextColor }}>Min Purchase: </span>
                                                                <span style={{ color: primaryTextColor }}>{formatCurrency(coupon.minPurchase)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {coupon.description && (
                                                        <p className="text-sm mt-2" style={{ color: secondaryTextColor }}>
                                                            {coupon.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-row sm:flex-col gap-2">
                                                    <button
                                                        onClick={() => handleApprove(coupon.id || coupon._id)}
                                                        className="btn btn-sm text-white px-4 py-2 font-medium"
                                                        style={{ backgroundColor: successColor }}
                                                        disabled={actionLoading === (coupon.id || coupon._id)}
                                                    >
                                                        {actionLoading === (coupon.id || coupon._id) ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Approve
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(coupon.id || coupon._id)}
                                                        className="btn btn-sm text-white px-4 py-2 font-medium"
                                                        style={{ backgroundColor: errorColor }}
                                                        disabled={actionLoading === (coupon.id || coupon._id)}
                                                    >
                                                        {actionLoading === (coupon.id || coupon._id) ? (
                                                            <span className="loading loading-spinner loading-xs"></span>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Reject
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <input
                                type="text"
                                placeholder={t('admin.searchCoupons') || 'Search coupons...'}
                                className="input input-bordered flex-grow border-2 text-sm sm:text-base px-4 py-2.5"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor, paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary text-white px-5 sm:px-6 py-2.5 text-sm sm:text-base font-medium transition-all duration-200 hover:shadow-md"
                                style={{ backgroundColor: buttonColor, paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
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
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <span className="ml-1.5">{t('common.search') || 'Search'}</span>
                            </button>
                        </form>
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
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: primaryTextColor }}>
                                        {t('admin.noCoupons') || 'No Coupons Found'}
                                    </h3>
                                    <p className="text-sm sm:text-base opacity-70 mb-4 sm:mb-6 px-4" style={{ color: secondaryTextColor }}>
                                        {t('admin.noCouponsDescription') || 'Create your first coupon to get started!'}
                                    </p>
                                    <Link
                                        to="/admin/coupons/create"
                                        className="btn btn-primary text-white inline-flex items-center gap-2 btn-sm sm:btn-md"
                                        style={{ backgroundColor: buttonColor }}
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
                                        {t('admin.addCoupon') || 'Add Coupon'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View - Small Devices */}
                            <div className="block md:hidden space-y-3 sm:space-y-4">
                                {coupons.map((coupon) => (
                                    <div
                                        key={coupon._id}
                                        className="bg-base-100 rounded-lg shadow-sm border"
                                        style={{ borderColor: secondaryTextColor, backgroundColor }}
                                    >
                                        <div className="p-4 space-y-3">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-base sm:text-lg mb-1" style={{ color: primaryTextColor }}>
                                                        {coupon.code}
                                                    </h3>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span
                                                            className="badge badge-xs px-2 py-0.5 font-medium"
                                                            style={{ backgroundColor: buttonColor, color: '#ffffff', border: 'none' }}
                                                        >
                                                            {coupon.type === 'percentage' ? t('admin.percentage') || 'Percentage' : t('admin.fixed') || 'Fixed'}
                                                        </span>
                                                        {getStatusBadge(coupon)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-2 border-t border-b py-3" style={{ borderColor: secondaryTextColor }}>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                                        {t('admin.discount') || 'Discount'}:
                                                    </span>
                                                    <span className="font-semibold text-sm" style={{ color: primaryTextColor }}>
                                                        {getDiscountDisplay(coupon)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                                        {t('admin.usage') || 'Usage'}:
                                                    </span>
                                                    <span className="text-sm" style={{ color: secondaryTextColor }}>
                                                        {coupon.usedCount || 0} / {coupon.usageLimit}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                                        {t('admin.expiry') || 'Expiry'}:
                                                    </span>
                                                    <span className="text-sm" style={{ color: secondaryTextColor }}>
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
                                                    className="btn btn-sm text-white flex-1 flex items-center justify-center gap-2 px-3 py-1.5 font-medium transition-all duration-200 hover:shadow-sm"
                                                    style={{ backgroundColor: buttonColor, paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
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
                                                    className="btn btn-sm text-white flex-1 flex items-center justify-center gap-2 px-4 py-2 font-medium transition-all duration-200 hover:shadow-sm"
                                                    style={{
                                                        backgroundColor: errorColor || '#ef4444',
                                                        paddingLeft: '1rem',
                                                        paddingRight: '1rem',
                                                        paddingTop: '0.5rem',
                                                        paddingBottom: '0.5rem'
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
                            <div className="hidden md:block bg-base-100 rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr style={{ backgroundColor: buttonColor }}>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>
                                                    {t('admin.code') || 'Code'}
                                                </th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>
                                                    {t('admin.type') || 'Type'}
                                                </th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>
                                                    {t('admin.discount') || 'Discount'}
                                                </th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>
                                                    {t('admin.usage') || 'Usage'}
                                                </th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>
                                                    {t('admin.status') || 'Status'}
                                                </th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>
                                                    {t('admin.expiry') || 'Expiry'}
                                                </th>
                                                <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>
                                                    {t('admin.actions') || 'Actions'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coupons.map((coupon) => (
                                                <tr key={coupon._id} className="transition-colors border-b" style={{ borderColor: secondaryTextColor }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-sm" style={{ color: primaryTextColor }}>
                                                            {coupon.code}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className="badge badge-xs px-2 py-0.5 font-medium"
                                                            style={{ backgroundColor: buttonColor, color: '#ffffff', border: 'none' }}
                                                        >
                                                            {coupon.type === 'percentage' ? t('admin.percentage') || 'Percentage' : t('admin.fixed') || 'Fixed'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="font-medium text-sm" style={{ color: primaryTextColor }}>
                                                            {getDiscountDisplay(coupon)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                            {coupon.usedCount || 0} / {coupon.usageLimit}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">{getStatusBadge(coupon)}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                                                            {coupon.expiryDate
                                                                ? new Date(coupon.expiryDate).toLocaleDateString()
                                                                : t('admin.noExpiry') || 'No Expiry'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-row gap-2">
                                                            <Link
                                                                to={`/admin/coupons/edit/${coupon._id}`}
                                                                className="btn btn-sm text-white px-3 py-1.5 font-medium transition-all duration-200 hover:shadow-sm"
                                                                style={{ backgroundColor: buttonColor, paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
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
                                                                <span className="hidden sm:inline ml-1">{t('common.edit') || 'Edit'}</span>
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(coupon._id)}
                                                                className="btn btn-sm text-white px-4 py-2 font-medium transition-all duration-200 hover:shadow-sm"
                                                                style={{
                                                                    backgroundColor: errorColor || '#ef4444',
                                                                    paddingLeft: '1rem',
                                                                    paddingRight: '1rem',
                                                                    paddingTop: '0.5rem',
                                                                    paddingBottom: '0.5rem'
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
                                                                        <span className="hidden sm:inline ml-1">{t('common.delete') || 'Delete'}</span>
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
                                <Pagination
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    totalItems={pagination.totalItems}
                                    itemsPerPage={pagination.itemsPerPage || 10}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CouponList;

