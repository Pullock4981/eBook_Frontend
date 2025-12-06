/**
 * App Routes Component
 * 
 * Main routing configuration for the application.
 * Defines all routes and their corresponding components.
 */

import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminRoute from '../components/common/AdminRoute';
import ErrorBoundary from '../components/common/ErrorBoundary';
import RootLayout from '../components/layout/RootLayout';

// Pages (will be created in later parts)
// For now, we'll create placeholder components
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

function Products() {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ backgroundColor: '#EFECE3' }}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1E293B' }}>{t('nav.products') || 'Products'}</h1>
            <p className="text-base sm:text-lg" style={{ color: '#2d3748' }}>{t('pages.productsComingSoon') || 'Products page coming soon...'}</p>
        </div>
    );
}

function Login() {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ backgroundColor: '#EFECE3' }}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1E293B' }}>{t('nav.login') || 'Login'}</h1>
            <p className="text-base sm:text-lg" style={{ color: '#2d3748' }}>{t('pages.loginComingSoon') || 'Login page coming soon...'}</p>
        </div>
    );
}

function Register() {
    const { t } = useTranslation();
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" style={{ backgroundColor: '#EFECE3' }}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1E293B' }}>{t('nav.register') || 'Register'}</h1>
            <p className="text-base sm:text-lg" style={{ color: '#2d3748' }}>{t('pages.registerComingSoon') || 'Register page coming soon...'}</p>
        </div>
    );
}

function Dashboard() {
    const { t } = useTranslation();
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
 * Wraps all routes with ErrorBoundary and RootLayout
 */
function AppRoutes() {
    return (
        <ErrorBoundary>
            <Routes>
                {/* Root Layout with Header and Footer */}
                <Route element={<RootLayout />}>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes (User) */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Routes (Admin) */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </ErrorBoundary>
    );
}

export default AppRoutes;

