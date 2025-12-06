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
import { selectIsAuthenticated, selectUser, logout } from '../../store/slices/authSlice';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import Logo from '../common/Logo';
import { useTranslation } from 'react-i18next';
import { getInitials } from '../../utils/helpers';

function Navbar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
        setMobileMenuOpen(false);
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Close mobile menu handler
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // Check if route is active
    const isActive = (path) => {
        return location.pathname === path;
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
                <ul className="menu menu-horizontal px-1 gap-1">
                    <li>
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-lg transition-colors ${isActive('/') ? 'text-white' : ''
                                }`}
                            style={
                                isActive('/')
                                    ? { backgroundColor: '#1E293B', color: '#ffffff' }
                                    : { color: '#1E293B' }
                            }
                        >
                            {t('nav.home') || 'Home'}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/products"
                            className={`px-4 py-2 rounded-lg transition-colors ${isActive('/products') ? 'text-white' : ''
                                }`}
                            style={
                                isActive('/products')
                                    ? { backgroundColor: '#1E293B', color: '#ffffff' }
                                    : { color: '#1E293B' }
                            }
                        >
                            {t('nav.products') || 'Products'}
                        </Link>
                    </li>
                    {isAuthenticated && (
                        <>
                            <li>
                                <Link
                                    to="/dashboard"
                                    className={`px-4 py-2 rounded-lg transition-colors ${isActive('/dashboard') ? 'text-white' : ''
                                        }`}
                                    style={
                                        isActive('/dashboard')
                                            ? { backgroundColor: '#1E293B', color: '#ffffff' }
                                            : { color: '#1E293B' }
                                    }
                                >
                                    {t('nav.dashboard') || 'Dashboard'}
                                </Link>
                            </li>
                            {user?.role === 'admin' && (
                                <li>
                                    <Link
                                        to="/admin"
                                        className={`px-4 py-2 rounded-lg transition-colors ${isActive('/admin') ? 'text-white' : ''
                                            }`}
                                        style={
                                            isActive('/admin')
                                                ? { backgroundColor: '#1E293B', color: '#ffffff' }
                                                : { color: '#1E293B' }
                                        }
                                    >
                                        {t('nav.admin') || 'Admin'}
                                    </Link>
                                </li>
                            )}
                        </>
                    )}
                </ul>
            </div>

            {/* Navbar End - Cart, Theme, Language, User Menu, Mobile Menu */}
            <div className="navbar-end gap-2">
                {/* Cart Icon - Always visible */}
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
                    {/* Cart Badge - You can add cart count here later */}
                    {/* <span className="badge badge-sm badge-primary absolute -top-1 -right-1">0</span> */}
                </Link>

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
                                style={{ backgroundColor: '#1E293B' }}
                            >
                                {user?.profile?.name ? getInitials(user.profile.name) : <span>U</span>}
                            </div>
                        </label>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg border"
                            style={{ borderColor: '#e2e8f0' }}
                        >
                            <li>
                                <Link to="/dashboard" style={{ color: '#1E293B' }}>
                                    {t('nav.profile') || 'Profile'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/orders" style={{ color: '#1E293B' }}>
                                    {t('nav.orders') || 'My Orders'}
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard/ebooks" style={{ color: '#1E293B' }}>
                                    {t('nav.ebooks') || 'My eBooks'}
                                </Link>
                            </li>
                            <li>
                                <button onClick={handleLogout} style={{ color: '#1E293B' }}>
                                    {t('nav.logout') || 'Logout'}
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
                                borderColor: '#1E293B',
                                color: '#1E293B',
                                backgroundColor: 'transparent'
                            }}
                        >
                            {t('nav.login') || 'Login'}
                        </Link>
                        <Link
                            to="/register"
                            className="btn btn-sm font-medium shadow-md"
                            style={{
                                backgroundColor: '#1E293B',
                                color: '#ffffff',
                                border: 'none'
                            }}
                        >
                            {t('nav.register') || 'Register'}
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Button - Right Side (Only on small screens) */}
                <div className="lg:hidden relative">
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
                            className="menu menu-sm bg-base-100 rounded-box z-[50] mt-3 w-64 p-2 shadow-lg border absolute right-0"
                            style={{ borderColor: '#e2e8f0', backgroundColor: '#EFECE3' }}
                        >
                            {/* Mobile Theme & Language */}
                            <li className="flex gap-2 p-2 sm:hidden">
                                <ThemeToggle />
                                <LanguageSwitcher />
                            </li>
                            <li className="divider sm:hidden"></li>

                            {/* Mobile Navigation Links */}
                            <li>
                                <Link
                                    to="/"
                                    className={isActive('/') ? 'active' : ''}
                                    style={isActive('/') ? {} : { color: '#1E293B' }}
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.home') || 'Home'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/products"
                                    className={isActive('/products') ? 'active' : ''}
                                    style={isActive('/products') ? {} : { color: '#1E293B' }}
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.products') || 'Products'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/cart"
                                    style={{ color: '#1E293B' }}
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.cart') || 'Cart'}
                                </Link>
                            </li>
                            {isAuthenticated && (
                                <>
                                    <li>
                                        <Link
                                            to="/dashboard"
                                            className={isActive('/dashboard') ? 'active' : ''}
                                            style={isActive('/dashboard') ? {} : { color: '#1E293B' }}
                                            onClick={closeMobileMenu}
                                        >
                                            {t('nav.dashboard') || 'Dashboard'}
                                        </Link>
                                    </li>
                                    {user?.role === 'admin' && (
                                        <li>
                                            <Link
                                                to="/admin"
                                                className={isActive('/admin') ? 'active' : ''}
                                                style={isActive('/admin') ? {} : { color: '#1E293B' }}
                                                onClick={closeMobileMenu}
                                            >
                                                {t('nav.admin') || 'Admin'}
                                            </Link>
                                        </li>
                                    )}
                                    <li className="divider"></li>
                                    <li>
                                        <Link
                                            to="/dashboard"
                                            style={{ color: '#1E293B' }}
                                            onClick={closeMobileMenu}
                                        >
                                            {t('nav.profile') || 'Profile'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard/orders"
                                            style={{ color: '#1E293B' }}
                                            onClick={closeMobileMenu}
                                        >
                                            {t('nav.orders') || 'My Orders'}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard/ebooks"
                                            style={{ color: '#1E293B' }}
                                            onClick={closeMobileMenu}
                                        >
                                            {t('nav.ebooks') || 'My eBooks'}
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            style={{ color: '#1E293B' }}
                                        >
                                            {t('nav.logout') || 'Logout'}
                                        </button>
                                    </li>
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
                                                borderColor: '#1E293B',
                                                color: '#1E293B',
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
                                                backgroundColor: '#1E293B',
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
