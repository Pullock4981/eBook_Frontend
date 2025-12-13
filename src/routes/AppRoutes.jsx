/**
 * App Routes Component
 * 
 * Main routing configuration for the application.
 * Defines all routes and their corresponding components.
 */

import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import GuestRoute from '../components/common/GuestRoute';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PublicLayout from '../components/layout/PublicLayout';
import UserLayout from '../components/layout/UserLayout';
import AdminLayout from '../components/layout/AdminLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import OTPVerification from '../pages/auth/OTPVerification';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import Categories from '../pages/Categories';
import EBooksList from '../pages/public/eBooksList';
import PDFViewerPage from '../pages/PDFViewerPage';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import OrderDetail from '../pages/OrderDetail';
import UserDashboard from '../pages/user/Dashboard';
import UserProfile from '../pages/user/Profile';
import UserAddresses from '../pages/user/Addresses';
import UserEBooks from '../pages/user/eBooks';
import EBookViewer from '../pages/user/eBookViewer';
import AffiliateDashboard from '../pages/user/Affiliate';
import AffiliateWithdraw from '../pages/user/AffiliateWithdraw';
import AdminProductList from '../pages/admin/Products/ProductList';
import AdminProductCreate from '../pages/admin/Products/ProductCreate';
import AdminProductEdit from '../pages/admin/Products/ProductEdit';
import AdminCategoryList from '../pages/admin/Categories/CategoryList';
import AdminUserList from '../pages/admin/Users/UserList';
import AdminOrderList from '../pages/admin/Orders/OrderList';
import AdminAffiliateList from '../pages/admin/Affiliates/AffiliateList';
import AdminCouponList from '../pages/admin/Coupons/CouponList';
import AdminCouponCreate from '../pages/admin/Coupons/CouponCreate';
import AdminCouponEdit from '../pages/admin/Coupons/CouponEdit';
import AdminPDFList from '../pages/admin/PDFs/PDFList';
import AdminDashboard from '../pages/admin/Dashboard';
import { selectUser, updateUser } from '../store/slices/authSlice';
import { getCurrentUser } from '../services/userService';

// Import Home component
import Home from '../pages/Home';

function Dashboard() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [isChecking, setIsChecking] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    // Check user role and redirect admin to admin dashboard
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                // Refresh user data to get latest role
                const response = await getCurrentUser();
                if (response?.success && response?.data) {
                    const updatedUser = response.data;
                    dispatch(updateUser(updatedUser));

                    // If user is admin, redirect to admin dashboard
                    if (updatedUser.role === 'admin') {
                        setShouldRedirect(true);
                        return;
                    }
                }

                // Check current user role in store
                if (user?.role === 'admin') {
                    setShouldRedirect(true);
                    return;
                }
            } catch (error) {
                // If error, check current user role
                if (user?.role === 'admin') {
                    setShouldRedirect(true);
                    return;
                }
            } finally {
                setIsChecking(false);
            }
        };

        checkUserRole();
    }, [dispatch, user?.role]);

    // Redirect admin to admin dashboard
    if (shouldRedirect) {
        return <Navigate to="/admin" replace />;
    }

    // Show loading while checking
    if (isChecking) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg" style={{ color: '#1E293B' }}></span>
                    <p className="mt-4" style={{ color: '#2d3748' }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ backgroundColor: '#EFECE3' }}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1E293B' }}>{t('nav.dashboard') || 'Dashboard'}</h1>
            <p className="text-base sm:text-lg" style={{ color: '#2d3748' }}>{t('pages.dashboardComingSoon') || 'Dashboard page coming soon...'}</p>
        </div>
    );
}


function NotFound() {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-center" style={{ backgroundColor: '#EFECE3' }}>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ color: '#1E293B' }}>404</h1>
            <p className="text-lg sm:text-xl mb-6" style={{ color: '#2d3748' }}>{t('pages.pageNotFound') || 'Page Not Found'}</p>
            <Link
                to="/"
                className="btn text-white"
                style={{ backgroundColor: '#1E293B' }}
            >
                {t('common.goHome') || 'Go Home'}
            </Link>
        </div>
    );
}

/**
 * App Routes Component
 * Wraps all routes with ErrorBoundary and appropriate layouts
 */
function AppRoutes() {
    return (
        <ErrorBoundary>
            <Routes>
                {/* Public Layout (Header + Footer) */}
                <Route element={<PublicLayout />}>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/ebooks" element={<EBooksList />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route
                        path="/pdf/view/:productId"
                        element={
                            <ProtectedRoute>
                                <PDFViewerPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />

                    {/* Guest Routes (Login, Register, OTP) */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/verify-otp"
                        element={
                            <GuestRoute>
                                <OTPVerification />
                            </GuestRoute>
                        }
                    />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* User Layout (Header + Sidebar) */}
                <Route
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/dashboard/profile" element={<UserProfile />} />
                    <Route path="/dashboard/orders" element={<Orders />} />
                    <Route path="/dashboard/ebooks" element={<UserEBooks />} />
                    <Route path="/dashboard/addresses" element={<UserAddresses />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/orders/:id" element={<OrderDetail />} />
                    <Route path="/ebooks/viewer/:productId" element={<EBookViewer />} />
                    <Route path="/dashboard/affiliate" element={<AffiliateDashboard />} />
                    <Route path="/dashboard/affiliate/withdraw" element={<AffiliateWithdraw />} />
                </Route>

                {/* Admin Layout (Header + Sidebar) */}
                <Route
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProductList />} />
                    <Route path="/admin/products/create" element={<AdminProductCreate />} />
                    <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
                    <Route path="/admin/categories" element={<AdminCategoryList />} />
                    <Route path="/admin/users" element={<AdminUserList />} />
                    <Route path="/admin/orders" element={<AdminOrderList />} />
                    <Route path="/admin/affiliates" element={<AdminAffiliateList />} />
                    <Route path="/admin/coupons" element={<AdminCouponList />} />
                    <Route path="/admin/coupons/create" element={<AdminCouponCreate />} />
                    <Route path="/admin/coupons/edit/:id" element={<AdminCouponEdit />} />
                    <Route path="/admin/pdfs" element={<AdminPDFList />} />
                </Route>
            </Routes>
        </ErrorBoundary>
    );
}

export default AppRoutes;

