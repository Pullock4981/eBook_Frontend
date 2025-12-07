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
import Cart from '../pages/Cart';
import AdminProductList from '../pages/admin/Products/ProductList';
import AdminProductCreate from '../pages/admin/Products/ProductCreate';
import AdminProductEdit from '../pages/admin/Products/ProductEdit';
import { selectUser, updateUser } from '../store/slices/authSlice';
import { getCurrentUser } from '../services/userService';

// Placeholder components
function Home() {
    const { t } = useTranslation();

    return (
        <div className="w-full" style={{ backgroundColor: '#EFECE3' }}>
            {/* Hero Section */}
            <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center space-y-6 sm:space-y-8">
                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            <span style={{ color: '#1E293B' }}>{t('home.discoverYourNext') || 'Discover Your Next'}</span>
                            <span className="block mt-2" style={{ color: '#6B8E6B' }}>{t('home.greatRead') || 'Great Read'}</span>
                        </h1>

                        {/* Description */}
                        <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed px-4" style={{ color: '#2d3748' }}>
                            {t('home.description') || 'Explore thousands of books, both physical and digital. From bestsellers to hidden gems, find your perfect story.'}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 px-4">
                            <Link
                                to="/products"
                                className="btn btn-lg px-6 sm:px-8 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto text-white"
                                style={{ backgroundColor: '#1E293B' }}
                            >
                                {t('home.browseBooks') || 'Browse Books'}
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-lg px-6 sm:px-8 font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105 w-full sm:w-auto text-white"
                                style={{ backgroundColor: '#6B8E6B' }}
                            >
                                {t('home.getStarted') || 'Get Started'}
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 pt-8 sm:pt-12 border-t" style={{ borderColor: '#e2e8f0' }}>
                            <div className="stat rounded-lg shadow-sm p-4 sm:p-6 bg-white">
                                <div className="stat-value text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>10K+</div>
                                <div className="stat-title text-sm sm:text-base" style={{ color: '#2d3748' }}>{t('home.booksAvailable') || 'Books Available'}</div>
                            </div>
                            <div className="stat rounded-lg shadow-sm p-4 sm:p-6 bg-white">
                                <div className="stat-value text-2xl sm:text-3xl font-bold" style={{ color: '#6B8E6B' }}>50K+</div>
                                <div className="stat-title text-sm sm:text-base" style={{ color: '#2d3748' }}>{t('home.happyReaders') || 'Happy Readers'}</div>
                            </div>
                            <div className="stat rounded-lg shadow-sm p-4 sm:p-6 bg-white">
                                <div className="stat-value text-2xl sm:text-3xl font-bold" style={{ color: '#1E293B' }}>4.8★</div>
                                <div className="stat-title text-sm sm:text-base" style={{ color: '#2d3748' }}>{t('home.averageRating') || 'Average Rating'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

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

function AdminDashboard() {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ backgroundColor: '#EFECE3' }}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1E293B' }}>{t('nav.admin') || 'Admin Dashboard'}</h1>
            <p className="text-base sm:text-lg" style={{ color: '#2d3748' }}>{t('pages.adminComingSoon') || 'Admin dashboard coming soon...'}</p>
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
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/cart" element={<Cart />} />

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
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/profile" element={<Dashboard />} />
                    <Route path="/dashboard/orders" element={<Dashboard />} />
                    <Route path="/dashboard/ebooks" element={<Dashboard />} />
                    <Route path="/dashboard/addresses" element={<Dashboard />} />
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
                    <Route path="/admin/categories" element={<AdminDashboard />} />
                    <Route path="/admin/orders" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<AdminDashboard />} />
                    <Route path="/admin/affiliates" element={<AdminDashboard />} />
                    <Route path="/admin/coupons" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </ErrorBoundary>
    );
}

export default AppRoutes;

