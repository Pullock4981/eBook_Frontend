/**
 * Products Page
 * 
 * Main products listing page with search, filters, and pagination
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../hooks/useProducts';
import { useThemeColors } from '../hooks/useThemeColors';
import ProductList from '../components/products/ProductList';
import ProductSearch from '../components/products/ProductSearch';
import ProductFilter from '../components/products/ProductFilter';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import CouponBanner from '../components/coupons/CouponBanner';

function Products() {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const {
        products,
        filters,
        pagination,
        isLoading,
        error,
        viewMode,
        setViewMode,
        updateFilters,
        clearAllFilters,
        changePage,
        changeItemsPerPage,
        handleSearch,
    } = useProducts();

    // Debug log in development
    if (import.meta.env.DEV) {
        console.log('Products Page - Products count:', products?.length || 0);
        console.log('Products Page - Products:', products);
        console.log('Products Page - Pagination:', pagination);
    }

    const [showFilters, setShowFilters] = useState(false);

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Page Header */}
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: primaryTextColor }}>
                        {t('nav.products') || 'Products'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {t('products.description') || 'Browse our collection of books'}
                    </p>
                </div>

                {/* Coupon Banner */}
                <CouponBanner />

                {/* Search and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-grow w-full sm:w-auto">
                        <ProductSearch onSearch={handleSearch} />
                    </div>
                    <div className="flex gap-2 items-center">
                        {/* Filter Toggle (Mobile) */}
                        <button
                            className="btn btn-outline btn-sm sm:hidden flex-shrink-0"
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ borderColor: buttonColor, color: primaryTextColor }}
                        >
                            <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                />
                            </svg>
                            <span className="hidden sm:inline ml-1">{t('common.filter') || 'Filter'}</span>
                        </button>
                        {/* View Mode Toggle */}
                        <div className="btn-group flex-shrink-0">
                            <button
                                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                style={{ backgroundColor: viewMode === 'grid' ? buttonColor : 'transparent', color: viewMode === 'grid' ? '#ffffff' : primaryTextColor, borderColor: secondaryTextColor }}
                            >
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                    />
                                </svg>
                            </button>
                            <button
                                className={`btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`}
                                onClick={() => setViewMode('list')}
                                style={{ backgroundColor: viewMode === 'list' ? buttonColor : 'transparent', color: viewMode === 'list' ? '#ffffff' : primaryTextColor, borderColor: secondaryTextColor }}
                            >
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5"
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
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-6">
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Filters Sidebar */}
                    <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        {showFilters && (
                            <div className="lg:hidden mb-4">
                                <button
                                    className="btn btn-sm btn-ghost w-full"
                                    onClick={() => setShowFilters(false)}
                                    style={{ color: primaryTextColor }}
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {t('common.close') || 'Close'}
                                </button>
                            </div>
                        )}
                        <ProductFilter onFilterChange={(newFilters) => {
                            updateFilters(newFilters);
                        }} />
                    </div>

                    {/* Products List */}
                    <div className="flex-grow">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loading />
                            </div>
                        ) : (
                            <>
                                <ProductList products={products} isLoading={isLoading} viewMode={viewMode} />

                                {/* Pagination */}
                                {pagination && pagination.totalPages > 1 && (
                                    <div className="mt-6">
                                        <Pagination
                                            currentPage={pagination.currentPage || 1}
                                            totalPages={pagination.totalPages || 1}
                                            totalItems={pagination.totalItems || 0}
                                            itemsPerPage={pagination.itemsPerPage || 8}
                                            onPageChange={changePage}
                                            onItemsPerPageChange={changeItemsPerPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Products;

