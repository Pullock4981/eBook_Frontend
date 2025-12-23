/**
 * Home Section Component
 * Reusable component for displaying product sections on home page
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../products/ProductCard';
import Loading from '../common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';

function HomeSection({ title, titleKey, products, seeMoreLink, loading, emptyMessage, emptyMessageKey }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor } = useThemeColors();

    const displayTitle = titleKey ? t(titleKey) : title;
    const displayEmptyMessage = emptyMessageKey ? t(emptyMessageKey) : emptyMessage;

    if (loading) {
        return (
            <section className="py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center py-12">
                        <Loading />
                    </div>
                </div>
            </section>
        );
    }

    if (!products || products.length === 0) {
        return (
            <section className="py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: primaryTextColor }}>
                            {displayTitle}
                        </h2>
                    </div>

                    {/* Empty State Message */}
                    <div className="text-center py-12 sm:py-16 px-4">
                        <div className="max-w-md mx-auto">
                            <div className="mb-4">
                                <svg 
                                    className="w-16 h-16 mx-auto" 
                                    style={{ color: buttonColor }} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-semibold mb-3" style={{ color: primaryTextColor }}>
                                {displayEmptyMessage || t('home.sections.emptyMessage') || 'Books Coming Soon!'}
                            </h3>
                            <p className="text-base sm:text-lg mb-6" style={{ color: secondaryTextColor }}>
                                {t('home.sections.emptyDescription') || 'We are adding amazing books very soon. Stay tuned!'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: primaryTextColor }}>
                        {displayTitle}
                    </h2>
                    {seeMoreLink && (
                        <Link
                            to={seeMoreLink}
                            className="btn btn-sm sm:btn-md px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md whitespace-nowrap"
                            style={{ backgroundColor: buttonColor, minHeight: '40px' }}
                            onMouseEnter={(e) => {
                                // Darken button on hover (reduce brightness by 10%)
                                const isDark = buttonColor === '#6B8E6B';
                                e.target.style.backgroundColor = isDark ? '#5a7a5a' : '#0f172a';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = buttonColor;
                            }}
                        >
                            {t('home.seeMore') || 'See More'}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((product) => (
                        <ProductCard key={product._id || product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HomeSection;

