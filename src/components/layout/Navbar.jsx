/**
 * Navbar Component
 * 
 * Main navigation bar for the application.
 * Uses DaisyUI navbar structure (navbar-start, navbar-center, navbar-end).
 * Fully responsive with mobile dropdown menu.
 * Mobile: Logo on left, hamburger on right.
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { selectIsAuthenticated, selectUser, logout, updateUser } from '../../store/slices/authSlice';
import { selectCartItemCount, fetchCart, clearCartState } from '../../store/slices/cartSlice';
import { fetchUserProfile, selectUserProfile } from '../../store/slices/userSlice';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Logo from '../common/Logo';
import { useTranslation } from 'react-i18next';
import { getInitials } from '../../utils/helpers';
import { getCurrentUser } from '../../services/userService';
import { useThemeColors } from '../../hooks/useThemeColors';

function Navbar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const profile = useSelector(selectUserProfile);
    const cartItemCount = useSelector(selectCartItemCount);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, isDark } = useThemeColors();

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCartState()); // Clear cart on logout
        navigate('/');
        setMobileMenuOpen(false);
    };

    // Get user name from profile (database) or authSlice user
    const getUserName = () => {
        const userName = profile?.profile?.name || profile?.name || user?.profile?.name || '';
        return userName || 'User';
    };

    // Get user initial for avatar
    const getUserInitial = () => {
        const userName = profile?.profile?.name || profile?.name || user?.profile?.name || '';
        return userName ? getInitials(userName) : 'U';
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Auto-refresh user data to detect role changes (e.g., manually made admin)
    useEffect(() => {
        if (!isAuthenticated) return;

        const refreshUserData = async () => {
            try {
                const response = await getCurrentUser();
                // API interceptor returns response.data, so check response structure
                if (response?.success && response?.data) {
                    const updatedUser = response.data;
                    // Only update if role or other important fields changed
                    if (user?.role !== updatedUser.role || user?.isVerified !== updatedUser.isVerified) {
                        dispatch(updateUser(updatedUser));
                    }
                }
            } catch (error) {
                // Silently fail - user might not be authenticated or token expired
                // Don't log in production to avoid console spam
                if (import.meta.env.DEV) {
                    console.log('Failed to refresh user data:', error.message);
                }
            }
        };

        // Refresh immediately on mount
        refreshUserData();

        // Refresh every 30 seconds to detect role changes
        const interval = setInterval(refreshUserData, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated, dispatch, user?.role, user?.isVerified]);

    // Fetch user profile data from database
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, isAuthenticated]);

    // Fetch cart when user is authenticated (on app load and login)
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [isAuthenticated, dispatch]);

    // Close mobile menu handler
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // Check if route is active
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <div className="navbar bg-base-100 shadow-sm border-b sticky top-0 z-50 mx-auto px-4 sm:px-6 lg:px-24" style={{ borderColor: '#e2e8f0' }}>
            {/* Navbar Start - Logo (Mobile: Left, Desktop: Left) */}
            <div className="navbar-start">
                {/* Logo - Always visible */}
                <Logo size="md" className="hidden sm:flex" />

                {/* Mobile Logo - Only on small screens */}
                <Logo size="sm" className="sm:hidden" />
            </div>

            {/* Navbar Center - Desktop Navigation */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2 flex-nowrap whitespace-nowrap items-center">
                    <li className="flex-shrink-0">
                        <Link
                            to="/"
                            className={`px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base ${isActive('/') ? 'text-white' : ''
                                }`}
                            style={
                                isActive('/')
                                    ? { backgroundColor: buttonColor, color: '#ffffff' }
                                    : { color: primaryTextColor }
                            }
                        >
                            {t('nav.home') || 'Home'}
                        </Link>
                    </li>
                    {/* Show Products only for non-admin users */}
                    {user?.role !== 'admin' && (
                        <li className="flex-shrink-0">
                            <Link
                                to="/products"
                                className={`px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base ${isActive('/products') ? 'text-white' : ''
                                    }`}
                                style={
                                    isActive('/products')
                                        ? { backgroundColor: buttonColor, color: '#ffffff' }
                                        : { color: primaryTextColor }
                                }
                            >
                                {t('nav.products') || 'Products'}
                            </Link>
                        </li>
                    )}
                    {/* Show Read PDF only for non-admin users */}
                    {user?.role !== 'admin' && (
                        <li className="flex-shrink-0">
                            <Link
                                to="/ebooks"
                                className={`px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base ${isActive('/ebooks') ? 'text-white' : ''
                                    }`}
                                style={
                                    isActive('/ebooks')
                                        ? { backgroundColor: buttonColor, color: '#ffffff' }
                                        : { color: primaryTextColor }
                                }
                            >
                                {t('nav.readPDF') || 'Read PDF'}
                            </Link>
                        </li>
                    )}
                    {isAuthenticated && (
                        <>
                            {/* Show Dashboard link only for non-admin users */}
                            {user?.role !== 'admin' && (
                                <li className="flex-shrink-0">
                                    <Link
                                        to="/dashboard"
                                        className={`px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base ${isActive('/dashboard') ? 'text-white' : ''
                                            }`}
                                        style={
                                            isActive('/dashboard')
                                                ? { backgroundColor: buttonColor, color: '#ffffff' }
                                                : { color: primaryTextColor }
                                        }
                                    >
                                        {t('nav.dashboard') || 'Dashboard'}
                                    </Link>
                                </li>
                            )}
                            {/* Show Admin link only for admin users */}
                            {user?.role === 'admin' && (
                                <li className="flex-shrink-0">
                                    <Link
                                        to="/admin"
                                        className={`px-3 xl:px-4 py-2 rounded-lg transition-colors text-sm xl:text-base ${isActive('/admin') ? 'text-white' : ''
                                            }`}
                                        style={
                                            isActive('/admin')
                                                ? { backgroundColor: buttonColor, color: '#ffffff' }
                                                : { color: primaryTextColor }
                                        }
                                    >
                                        {t('nav.adminDashboard') || 'Admin Dashboard'}
                                    </Link>
                                </li>
                            )}
                        </>
                    )}
                </ul>
            </div>

            {/* Navbar End - Cart, Theme, Language, User Menu, Mobile Menu */}
            <div className="navbar-end gap-2">
                {/* Cart Icon - Only visible for non-admin users */}
                {user?.role !== 'admin' && (
                    <Link
                        to="/cart"
                        className="btn btn-ghost btn-circle relative"
                        aria-label="Shopping Cart"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 badge badge-sm badge-primary text-white" style={{ backgroundColor: buttonColor }}>
                                {cartItemCount > 99 ? '99+' : cartItemCount}
                            </span>
                        )}
                    </Link>
                )}

                {/* Theme Toggle - Hidden on mobile */}
                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                {/* Language Switcher - Hidden on mobile */}
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>

                {/* Desktop: User Menu / Auth Buttons */}
                {isAuthenticated ? (
                    <div className="dropdown dropdown-end hidden sm:block">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div
                                className="w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                style={{ backgroundColor: buttonColor }}
                            >
                                {user?.profile?.name ? getInitials(user.profile.name) : <span>U</span>}
                            </div>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu menu-sm rounded-lg z-[1] mt-3 min-w-[200px] max-w-[280px] shadow-xl border"
                            style={{ borderColor: secondaryTextColor, backgroundColor }}
                        >
                            {/* User Info Section */}
                            <li className="px-3 pt-3 pb-2 mb-2 border-b" style={{ borderColor: secondaryTextColor }}>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                                        style={{ backgroundColor: buttonColor }}
                                    >
                                        {getUserInitial()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate" style={{ color: primaryTextColor }}>
                                            {getUserName()}
                                        </p>
                                        <p className="text-xs truncate opacity-70" style={{ color: secondaryTextColor }}>
                                            {user?.mobile || user?.email || ''}
                                        </p>
                                    </div>
                                </div>
                            </li>
                            {/* Show user dashboard links only for non-admin users */}
                            {user?.role !== 'admin' && (
                                <>
                                    <li>
                                        <Link
                                            to="/dashboard"
                                            className="rounded-lg transition-colors"
                                            style={{
                                                color: primaryTextColor,
                                                backgroundColor: isActive('/dashboard') ? buttonColor + '20' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive('/dashboard')) {
                                                    e.target.style.backgroundColor = secondaryTextColor + '10';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive('/dashboard')) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            {t('nav.profile')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard/orders"
                                            className="rounded-lg transition-colors"
                                            style={{
                                                color: primaryTextColor,
                                                backgroundColor: isActive('/dashboard/orders') ? buttonColor + '20' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive('/dashboard/orders')) {
                                                    e.target.style.backgroundColor = secondaryTextColor + '10';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive('/dashboard/orders')) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            {t('nav.orders')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard/ebooks"
                                            className="rounded-lg transition-colors"
                                            style={{
                                                color: primaryTextColor,
                                                backgroundColor: isActive('/dashboard/ebooks') ? buttonColor + '20' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive('/dashboard/ebooks')) {
                                                    e.target.style.backgroundColor = secondaryTextColor + '10';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive('/dashboard/ebooks')) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            {t('nav.ebooks')}
                                        </Link>
                                    </li>
                                </>
                            )}
                            {/* Show admin link for admin users */}
                            {user?.role === 'admin' && (
                                <li>
                                    <Link
                                        to="/admin"
                                        className="rounded-lg transition-colors"
                                        style={{
                                            color: primaryTextColor,
                                            backgroundColor: isActive('/admin') ? buttonColor + '20' : 'transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive('/admin')) {
                                                e.target.style.backgroundColor = secondaryTextColor + '10';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive('/admin')) {
                                                e.target.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {t('nav.admin')}
                                    </Link>
                                </li>
                            )}
                            <li className="mt-2 pt-2 border-t px-2" style={{ borderColor: secondaryTextColor }}>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-lg transition-colors w-full text-left px-3 py-2"
                                    style={{
                                        color: '#dc2626',
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#dc2626';
                                        e.target.style.color = '#ffffff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#dc2626';
                                    }}
                                >
                                    {t('nav.logout')}
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="hidden sm:flex gap-2">
                        <Link
                            to="/login"
                            className="btn btn-outline btn-sm border-2 font-medium"
                            style={{
                                borderColor: buttonColor,
                                color: primaryTextColor,
                                backgroundColor: 'transparent'
                            }}
                        >
                            {t('nav.login') || 'Login'}
                        </Link>
                        <Link
                            to="/register"
                            className="btn btn-sm font-medium shadow-md"
                            style={{
                                backgroundColor: buttonColor,
                                color: '#ffffff',
                                border: 'none'
                            }}
                        >
                            {t('nav.register') || 'Register'}
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Button - Right Side (Only on small screens) */}
                <div className="lg:hidden flex items-center gap-2">
                    {/* User Icon for Small Devices */}
                    {isAuthenticated ? (
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                <div
                                    className="w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                                    style={{ backgroundColor: buttonColor }}
                                >
                                    {user?.profile?.name ? getInitials(user.profile.name) : <span>U</span>}
                                </div>
                            </label>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content rounded-lg z-[1] mt-3 min-w-[200px] max-w-[280px] p-3 shadow-xl border"
                                style={{ borderColor: secondaryTextColor, backgroundColor }}
                            >
                                {/* User Info Section */}
                                <li className="mb-2 pb-2 border-b" style={{ borderColor: secondaryTextColor }}>
                                    <div className="flex items-center gap-3 px-2 py-2">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                                            style={{ backgroundColor: buttonColor }}
                                        >
                                            {getUserInitial()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate" style={{ color: primaryTextColor }}>
                                                {getUserName()}
                                            </p>
                                            <p className="text-xs truncate opacity-70" style={{ color: secondaryTextColor }}>
                                                {user?.mobile || user?.email || ''}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                                {/* Show user dashboard links only for non-admin users */}
                                {user?.role !== 'admin' && (
                                    <>
                                        <li>
                                            <Link
                                                to="/dashboard"
                                                className="rounded-lg transition-colors"
                                                style={{
                                                    color: primaryTextColor,
                                                    backgroundColor: isActive('/dashboard') ? buttonColor + '20' : 'transparent'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive('/dashboard')) {
                                                        e.target.style.backgroundColor = secondaryTextColor + '10';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive('/dashboard')) {
                                                        e.target.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                {t('nav.profile')}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/dashboard/orders"
                                                className="rounded-lg transition-colors"
                                                style={{
                                                    color: primaryTextColor,
                                                    backgroundColor: isActive('/dashboard/orders') ? buttonColor + '20' : 'transparent'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive('/dashboard/orders')) {
                                                        e.target.style.backgroundColor = secondaryTextColor + '10';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive('/dashboard/orders')) {
                                                        e.target.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                {t('nav.orders')}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/dashboard/ebooks"
                                                className="rounded-lg transition-colors"
                                                style={{
                                                    color: primaryTextColor,
                                                    backgroundColor: isActive('/dashboard/ebooks') ? buttonColor + '20' : 'transparent'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive('/dashboard/ebooks')) {
                                                        e.target.style.backgroundColor = secondaryTextColor + '10';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive('/dashboard/ebooks')) {
                                                        e.target.style.backgroundColor = 'transparent';
                                                    }
                                                }}
                                            >
                                                {t('nav.ebooks')}
                                            </Link>
                                        </li>
                                    </>
                                )}
                                {/* Show admin link for admin users */}
                                {user?.role === 'admin' && (
                                    <li>
                                        <Link
                                            to="/admin"
                                            className="rounded-lg transition-colors"
                                            style={{
                                                color: primaryTextColor,
                                                backgroundColor: isActive('/admin') ? buttonColor + '20' : 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive('/admin')) {
                                                    e.target.style.backgroundColor = secondaryTextColor + '10';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive('/admin')) {
                                                    e.target.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            {t('nav.admin')}
                                        </Link>
                                    </li>
                                )}
                                <li className="mt-2 pt-2 border-t px-2" style={{ borderColor: secondaryTextColor }}>
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-lg transition-colors w-full text-left px-3 py-2"
                                        style={{
                                            color: '#dc2626',
                                            backgroundColor: 'transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#dc2626';
                                            e.target.style.color = '#ffffff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.color = '#dc2626';
                                        }}
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="btn btn-ghost btn-circle"
                            aria-label="Login"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                style={{ color: primaryTextColor }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </Link>
                    )}
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    {/* Backdrop overlay */}
                    {mobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-30 z-[45]"
                            onClick={closeMobileMenu}
                        ></div>
                    )}
                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <ul
                            className="menu menu-sm rounded-lg z-[50] w-80 max-w-[88vw] p-4 shadow-2xl border-2 fixed right-3 top-20 max-h-[75vh] overflow-hidden bg-base-100"
                            style={{ borderColor: secondaryTextColor, backgroundColor }}
                        >
                            {/* Mobile Theme & Language - Side by Side */}
                            <li className="flex flex-row gap-2 p-2 sm:hidden mb-2 items-center justify-start">
                                <div className="flex-shrink-0">
                                    <ThemeToggle />
                                </div>
                                <div className="flex-shrink-0">
                                    <LanguageSwitcher />
                                </div>
                            </li>
                            <li className="divider sm:hidden my-2"></li>

                            {/* Mobile Navigation Links */}
                            <li>
                                <Link
                                    to="/"
                                    className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/') ? 'bg-primary text-white font-semibold' : 'hover:bg-base-200'}`}
                                    style={isActive('/') ? { backgroundColor: buttonColor, color: '#ffffff' } : { color: primaryTextColor }}
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.home') || 'Home'}
                                </Link>
                            </li>
                            {/* Show Products only for non-admin users */}
                            {user?.role !== 'admin' && (
                                <li>
                                    <Link
                                        to="/products"
                                        className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/products') ? 'bg-primary text-white font-semibold' : 'hover:bg-base-200'}`}
                                        style={isActive('/products') ? { backgroundColor: buttonColor, color: '#ffffff' } : { color: primaryTextColor }}
                                        onClick={closeMobileMenu}
                                    >
                                        {t('nav.products') || 'Products'}
                                    </Link>
                                </li>
                            )}
                            {/* Show Read PDF only for non-admin users */}
                            {user?.role !== 'admin' && (
                                <li>
                                    <Link
                                        to="/ebooks"
                                        className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/ebooks') ? 'bg-primary text-white font-semibold' : 'hover:bg-base-200'}`}
                                        style={isActive('/ebooks') ? { backgroundColor: buttonColor, color: '#ffffff' } : { color: primaryTextColor }}
                                        onClick={closeMobileMenu}
                                    >
                                        {t('nav.readPDF') || 'Read PDF'}
                                    </Link>
                                </li>
                            )}
                            {/* Cart - Only visible for non-admin users */}
                            {user?.role !== 'admin' && (
                                <li>
                                    <Link
                                        to="/cart"
                                        className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/cart') ? 'bg-primary text-white font-semibold' : 'hover:bg-base-200'}`}
                                        style={isActive('/cart') ? { backgroundColor: buttonColor, color: '#ffffff' } : { color: primaryTextColor }}
                                        onClick={closeMobileMenu}
                                    >
                                        {t('nav.cart') || 'Cart'}
                                    </Link>
                                </li>
                            )}
                            {isAuthenticated && (
                                <>
                                    {/* Show Dashboard link only for non-admin users */}
                                    {user?.role !== 'admin' && (
                                        <li>
                                            <Link
                                                to="/dashboard"
                                                className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-primary text-white font-semibold' : 'hover:bg-base-200'}`}
                                                style={isActive('/dashboard') ? { backgroundColor: buttonColor, color: '#ffffff' } : { color: primaryTextColor }}
                                                onClick={closeMobileMenu}
                                            >
                                                {t('nav.dashboard') || 'Dashboard'}
                                            </Link>
                                        </li>
                                    )}
                                    {/* Show Admin link only for admin users */}
                                    {user?.role === 'admin' && (
                                        <li>
                                            <Link
                                                to="/admin"
                                                className={`px-4 py-2.5 rounded-lg transition-colors ${isActive('/admin') ? 'bg-primary text-white font-semibold' : 'hover:bg-base-200'}`}
                                                style={isActive('/admin') ? { backgroundColor: buttonColor, color: '#ffffff' } : { color: primaryTextColor }}
                                                onClick={closeMobileMenu}
                                            >
                                                {t('nav.adminDashboard') || 'Admin Dashboard'}
                                            </Link>
                                        </li>
                                    )}
                                </>
                            )}
                            {!isAuthenticated && (
                                <>
                                    <li className="divider"></li>
                                    <li>
                                        <Link
                                            to="/login"
                                            className="btn btn-outline btn-block border-2 font-medium mb-2"
                                            style={{
                                                borderColor: buttonColor,
                                                color: primaryTextColor,
                                                backgroundColor: 'transparent'
                                            }}
                                            onClick={closeMobileMenu}
                                        >
                                            {t('nav.login') || 'Login'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/register"
                                            className="btn btn-block font-medium shadow-md"
                                            style={{
                                                backgroundColor: buttonColor,
                                                color: '#ffffff',
                                                border: 'none'
                                            }}
                                            onClick={closeMobileMenu}
                                        >
                                            {t('nav.register') || 'Register'}
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Navbar;
