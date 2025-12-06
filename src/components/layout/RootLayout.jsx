/**
 * Root Layout Component
 * 
 * Main layout wrapper for the entire application.
 * Includes Header, main content area, and Footer.
 * Ensures consistent layout across all pages.
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function RootLayout() {
    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: '#EFECE3' }}>
            {/* Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow w-full transition-colors duration-300" style={{ backgroundColor: '#EFECE3' }}>
                <Outlet />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default RootLayout;

