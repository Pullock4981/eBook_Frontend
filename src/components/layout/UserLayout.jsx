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

                {/* Mobile Sidebar Toggle Button - Top Left */}
                <button
                    className="lg:hidden fixed top-20 left-4 z-50 btn btn-circle shadow-lg"
                    style={{ backgroundColor: '#1E293B', color: '#ffffff', width: '48px', height: '48px' }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    <svg
                        className="w-6 h-6"
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

