/**
 * Public Layout Component
 * 
 * Layout for public pages (Home, Products, etc.)
 * Includes Navbar and Footer.
 */

import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-base-100 transition-colors duration-300">
            {/* Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow w-full bg-base-100 transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet />
                </motion.div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default PublicLayout;

