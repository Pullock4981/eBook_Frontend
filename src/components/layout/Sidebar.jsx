/**
 * Sidebar Component
 * 
 * Sidebar navigation for user and admin dashboards.
 * Responsive design with mobile menu support.
 */

import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { motion } from 'framer-motion';

function Sidebar({ isAdmin = false, onLinkClick }) {
    const { t } = useTranslation();
    const location = useLocation();
    const user = useSelector(selectUser);

    // Check if route is active
    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    // User sidebar menu items
    const userMenuItems = [
        {
            path: '/dashboard',
            label: t('nav.dashboard') || 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            path: '/dashboard/profile',
            label: t('nav.profile') || 'Profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            path: '/dashboard/orders',
            label: t('nav.orders') || 'My Orders',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            path: '/dashboard/ebooks',
            label: t('nav.ebooks') || 'My eBooks',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
        },
        {
            path: '/dashboard/addresses',
            label: t('nav.addresses') || 'Addresses',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
        },
    ];

    // Admin sidebar menu items
    const adminMenuItems = [
        {
            path: '/admin',
            label: t('nav.adminDashboard') || 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            path: '/admin/products',
            label: t('nav.products') || 'Products',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
        {
            path: '/admin/categories',
            label: t('nav.categories') || 'Categories',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            ),
        },
        {
            path: '/admin/orders',
            label: t('admin.orders.title') || 'Order Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            path: '/admin/users',
            label: t('nav.users') || 'Users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            path: '/admin/affiliates',
            label: t('nav.affiliates') || 'Affiliates',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            path: '/admin/coupons',
            label: t('nav.coupons') || 'Coupons',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
        },
    ];

    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    return (
        <aside className="w-64 min-h-screen bg-base-100 border-r-2 shadow-sm transition-colors duration-300" style={{ borderColor: '#cbd5e1', backgroundColor: '#ffffff' }}>
            <div className="p-5 sm:p-6 md:p-8">
                {/* Mobile Close Button */}
                <div className="lg:hidden flex justify-end mb-5 sm:mb-6">
                    <button
                        onClick={onLinkClick}
                        className="btn btn-ghost btn-sm btn-circle"
                        aria-label="Close sidebar"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: '#1E293B' }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* User Info - Same style for both user and admin */}
                {user && (
                    <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-lg bg-base-100 shadow-sm" style={{ borderColor: '#e2e8f0', borderWidth: '1px' }}>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                style={{ backgroundColor: '#1E293B' }}
                            >
                                {user?.profile?.name ? user.profile.name.charAt(0).toUpperCase() : (isAdmin ? 'A' : 'U')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: '#1E293B' }}>
                                    {user?.profile?.name || (isAdmin ? 'Admin' : 'User')}
                                </p>
                                <p className="text-xs truncate" style={{ color: '#64748b' }}>
                                    {user?.mobile || user?.profile?.email || (isAdmin ? 'Administrator' : '')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Menu Items */}
                <nav className="space-y-2">
                    {menuItems.map((item, index) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={item.path}
                                className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 rounded-lg transition-all duration-200 text-sm sm:text-base ${isActive(item.path)
                                    ? 'bg-primary text-white shadow-md font-semibold'
                                    : 'text-base-content hover:bg-base-200 font-medium'
                                    }`}
                                style={
                                    isActive(item.path)
                                        ? { backgroundColor: '#1E293B', color: '#ffffff' }
                                        : { color: '#1E293B' }
                                }
                                onClick={() => {
                                    // Close mobile sidebar when link is clicked
                                    if (onLinkClick && window.innerWidth < 1024) {
                                        onLinkClick();
                                    }
                                }}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                <span className="font-medium truncate">{item.label}</span>
                            </Link>
                        </motion.div>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;

