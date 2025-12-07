/**
 * User Layout Component
 * 
 * Layout for authenticated user pages (Dashboard, Profile, Orders, etc.)
 * Includes Navbar, Sidebar, and Breadcrumbs.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';

function UserLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-base-100 transition-colors duration-300">
            {/* Navbar */}
            <Navbar />

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-grow relative">
                {/* Sidebar - Desktop (Always visible on large screens) */}
                <aside className="hidden lg:block flex-shrink-0">
                    <Sidebar isAdmin={false} />
                </aside>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile Sidebar - Slide in from left */}
                <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: sidebarOpen ? 0 : -300 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="lg:hidden fixed left-0 top-0 h-full z-40 shadow-2xl"
                >
                    <Sidebar isAdmin={false} onLinkClick={() => setSidebarOpen(false)} />
                </motion.div>

                {/* Main Content */}
                <main className="flex-grow w-full bg-base-100 transition-colors duration-300 lg:ml-0">
                    <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
                        {/* Mobile Menu Section - Above page content */}
                        <div className="lg:hidden w-full mb-3 sm:mb-4 pt-3 sm:pt-4">
                            <div className="flex items-center justify-between bg-base-100 rounded-lg shadow-sm border border-base-200 p-2 sm:p-3">
                                <button
                                    className="btn btn-sm sm:btn-md rounded-lg shadow-sm flex items-center justify-center"
                                    style={{ backgroundColor: '#1E293B', color: '#ffffff', minWidth: '44px', height: '44px' }}
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    aria-label="Toggle sidebar"
                                >
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        {sidebarOpen ? (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        ) : (
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        )}
                                    </svg>
                                </button>
                                <span className="text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                                    Menu
                                </span>
                            </div>
                        </div>

                        {/* Breadcrumbs */}
                        <Breadcrumbs />

                        {/* Page Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Outlet />
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UserLayout;

