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
            <div className="flex flex-grow">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar isAdmin={false} />
                </div>

                {/* Mobile Sidebar Toggle Button */}
                <button
                    className="lg:hidden fixed bottom-4 right-4 z-40 btn btn-circle shadow-lg"
                    style={{ backgroundColor: '#1E293B', color: '#ffffff' }}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {/* Mobile Sidebar Overlay */}
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <motion.div
                    initial={{ x: -300 }}
                    animate={{ x: sidebarOpen ? 0 : -300 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="lg:hidden fixed left-0 top-0 h-full z-40"
                >
                    <Sidebar isAdmin={false} />
                </motion.div>

                {/* Main Content */}
                <main className="flex-grow w-full bg-base-100 transition-colors duration-300">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

