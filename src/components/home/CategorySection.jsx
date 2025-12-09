/**
 * Category Section Component
 * Displays categories on home page
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loading from '../common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';

function CategorySection({ categories, seeMoreLink, loading }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor } = useThemeColors();

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

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: primaryTextColor }}>
                        {t('home.sections.categories') || 'Browse Categories'}
                    </h2>
                    {seeMoreLink && (
                        <Link
                            to={seeMoreLink}
                            className="btn btn-sm sm:btn-md px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md whitespace-nowrap"
                            style={{ backgroundColor: buttonColor, minHeight: '40px' }}
                            onMouseEnter={(e) => {
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

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category._id || category.id}
                            to={`/categories/${category._id || category.id}`}
                            className="group bg-white rounded-lg shadow-sm p-4 sm:p-6 border-2 transition-all duration-200 hover:shadow-md hover:scale-105"
                            style={{ borderColor: '#e2e8f0' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#6B8E6B';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            <div className="text-center">
                                {/* Category Icon/Image */}
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                                    {category.icon ? (
                                        <img src={category.icon} alt={category.name} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <svg className="w-8 h-8" style={{ color: '#6B8E6B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    )}
                                </div>
                                {/* Category Name */}
                                <h3 className="text-sm sm:text-base font-semibold mb-1 group-hover:text-[#6B8E6B] transition-colors" style={{ color: primaryTextColor }}>
                                    {category.name}
                                </h3>
                                {/* Product Count */}
                                {category.productCount !== undefined && (
                                    <p className="text-xs" style={{ color: secondaryTextColor }}>
                                        {category.productCount} {t('home.products') || 'products'}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CategorySection;

