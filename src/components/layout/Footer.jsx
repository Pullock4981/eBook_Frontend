/**
 * Footer Component
 * 
 * Main footer for the application.
 * Includes links, contact information, and copyright.
 * Uses theme colors from DaisyUI.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APP_CONFIG } from '../../utils/constants';
import Logo from '../common/Logo';
import { useThemeColors } from '../../hooks/useThemeColors';

function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const { primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();

    return (
        <footer
            className="footer p-6 sm:p-8 lg:p-10 border-t shadow-lg"
            style={{
                backgroundColor: backgroundColor,
                borderTopWidth: '2px',
                borderTopStyle: 'solid',
                borderTopColor: primaryTextColor,
                boxShadow: '0 -4px 12px rgba(30, 41, 59, 0.15), 0 -2px 4px rgba(30, 41, 59, 0.1)'
            }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {/* About Section */}
                    <div>
                        <Logo size="md" className="mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base" style={{ color: secondaryTextColor }}>
                            {t('footer.description') || 'Your one-stop shop for books, both physical and digital.'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4" style={{ color: primaryTextColor }}>
                            {t('footer.quickLinks') || 'Quick Links'}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/products"
                                    className="text-sm sm:text-base hover:underline transition-colors"
                                    style={{ color: secondaryTextColor }}
                                >
                                    {t('nav.products') || 'Products'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/categories"
                                    className="text-sm sm:text-base hover:underline transition-colors"
                                    style={{ color: secondaryTextColor }}
                                >
                                    {t('footer.categories') || 'Categories'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/about"
                                    className="text-sm sm:text-base hover:underline transition-colors"
                                    style={{ color: secondaryTextColor }}
                                >
                                    {t('footer.aboutUs') || 'About Us'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact"
                                    className="text-sm sm:text-base hover:underline transition-colors"
                                    style={{ color: secondaryTextColor }}
                                >
                                    {t('footer.contact') || 'Contact'}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4" style={{ color: primaryTextColor }}>
                            {t('footer.customerService') || 'Customer Service'}
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/help"
                                    className="text-sm sm:text-base hover:underline transition-colors"
                                    style={{ color: secondaryTextColor }}
                                >
                                    {t('footer.help') || 'Help Center'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/shipping"
                                    className="text-sm sm:text-base hover:underline transition-colors"
                                    style={{ color: secondaryTextColor }}
                                >
                                    {t('footer.shipping') || 'Shipping Info'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/returns"
                                    className="text-sm sm:text-base hover:underline transition-colors"
                                    style={{ color: secondaryTextColor }}
                                >
                                    {t('footer.returns') || 'Returns'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/faq"
                                    className="text-sm sm:text-base hover:underline transition-colors"
                                    style={{ color: secondaryTextColor }}
                                >
                                    {t('footer.faq') || 'FAQ'}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4" style={{ color: primaryTextColor }}>
                            {t('footer.contact') || 'Contact'}
                        </h3>
                        <ul className="space-y-2 text-sm sm:text-base" style={{ color: secondaryTextColor }}>
                            <li>
                                <span className="font-semibold" style={{ color: primaryTextColor }}>Email:</span> {APP_CONFIG.SUPPORT_EMAIL}
                            </li>
                            <li>
                                <span className="font-semibold" style={{ color: primaryTextColor }}>Phone:</span> {APP_CONFIG.SUPPORT_PHONE}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center" style={{ borderColor: '#e2e8f0' }}>
                    <p className="text-xs sm:text-sm" style={{ color: secondaryTextColor }}>
                        © {currentYear} {APP_CONFIG.NAME}. {t('footer.allRightsReserved') || 'All rights reserved.'}
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
