/**
 * Orders Page
 * 
 * User's order history page
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserOrders, selectOrders, selectOrdersLoading, selectOrdersError, selectOrdersPagination } from '../store/slices/orderSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import OrderCard from '../components/orders/OrderCard';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';

function Orders() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const orders = useSelector(selectOrders);
    const isLoading = useSelector(selectOrdersLoading);
    const error = useSelector(selectOrdersError);
    const pagination = useSelector(selectOrdersPagination);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchUserOrders({ page: pagination.currentPage, limit: pagination.itemsPerPage }));
    }, [dispatch, isAuthenticated, navigate]);

    const handlePageChange = (page) => {
        dispatch(fetchUserOrders({ page, limit: pagination.itemsPerPage }));
    };

    const handleItemsPerPageChange = (limit) => {
        dispatch(fetchUserOrders({ page: 1, limit }));
    };

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-1.5" style={{ color: '#1E293B' }}>
                        {t('orders.title') || 'My Orders'}
                    </h1>
                    <p className="text-sm text-gray-600" style={{ color: '#64748b' }}>
                        {t('orders.subtitle') || 'View and track your order history'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-6">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm sm:text-base">{error}</span>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && orders.length === 0 ? (
                    <div className="flex justify-center items-center py-12">
                        <Loading />
                    </div>
                ) : orders.length === 0 ? (
                    /* Empty State */
                    <div className="card bg-base-100 shadow-sm">
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: '#1E293B' }}>
                                    {t('orders.noOrders') || 'No Orders Yet'}
                                </h3>
                                <p className="text-sm sm:text-base opacity-70 mb-4 sm:mb-6 px-4" style={{ color: '#2d3748' }}>
                                    {t('orders.noOrdersDescription') || 'You haven\'t placed any orders yet. Start shopping to see your orders here!'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Orders List */
                    <div className="space-y-4 sm:space-y-5">
                        {orders.map((order) => (
                            <OrderCard key={order._id} order={order} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            itemsPerPage={pagination.itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;

