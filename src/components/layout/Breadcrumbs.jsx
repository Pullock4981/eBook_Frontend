/**
 * Breadcrumbs Component
 * 
 * Navigation breadcrumbs for better user navigation.
 * Shows current page location and allows easy navigation.
 */

import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

function Breadcrumbs() {
    const { t } = useTranslation();
    const location = useLocation();

    // Generate breadcrumb items from pathname
    const generateBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [
            {
                label: t('nav.home') || 'Home',
                path: '/',
            },
        ];

        let currentPath = '';
        paths.forEach((path, index) => {
            currentPath += `/${path}`;

            // Skip if it's a dynamic route (contains numbers or IDs)
            if (/^\d+$/.test(path) || path.length > 20) {
                return;
            }

            // Translate common paths
            let label = path;
            const translations = {
                dashboard: t('nav.dashboard') || 'Dashboard',
                profile: t('nav.profile') || 'Profile',
                orders: t('nav.orders') || 'Orders',
                ebooks: t('nav.ebooks') || 'eBooks',
                addresses: t('nav.addresses') || 'Addresses',
                products: t('nav.products') || 'Products',
                admin: t('nav.admin') || 'Admin',
                categories: t('nav.categories') || 'Categories',
                users: t('nav.users') || 'Users',
                affiliates: t('nav.affiliates') || 'Affiliates',
                coupons: t('nav.coupons') || 'Coupons',
            };

            if (translations[path]) {
                label = translations[path];
            } else {
                // Capitalize first letter
                label = path.charAt(0).toUpperCase() + path.slice(1);
            }

            breadcrumbs.push({
                label,
                path: currentPath,
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    // Don't show breadcrumbs on home page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <nav className="hidden md:flex items-center space-x-2 text-sm mb-4" aria-label="Breadcrumb">
            <motion.ol
                className="flex items-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <li key={crumb.path} className="flex items-center">
                            {index > 0 && (
                                <svg
                                    className="w-4 h-4 mx-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    style={{ color: '#64748b' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            )}
                            {isLast ? (
                                <span className="font-medium" style={{ color: '#1E293B' }}>
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className="hover:underline transition-colors"
                                    style={{ color: '#64748b' }}
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </motion.ol>
        </nav>
    );
}

export default Breadcrumbs;

