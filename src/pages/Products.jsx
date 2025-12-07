/**
 * Products Page
 * 
 * Main products listing page with search, filters, and pagination
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../hooks/useProducts';
import ProductList from '../components/products/ProductList';
import ProductSearch from '../components/products/ProductSearch';
import ProductFilter from '../components/products/ProductFilter';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import CouponBanner from '../components/coupons/CouponBanner';

function Products() {
    const { t } = useTranslation();
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
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('nav.products') || 'Products'}
                    </h1>
                    <p className="text-base opacity-70" style={{ color: '#2d3748' }}>
                        {t('products.description') || 'Browse our collection of books'}
                    </p>
                </div>

                {/* Coupon Banner */}
                <CouponBanner />

                {/* Search and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-grow">
                        <ProductSearch onSearch={handleSearch} />
                    </div>
                    <div className="flex gap-2">
                        {/* Filter Toggle (Mobile) */}
                        <button
                            className="btn btn-outline sm:hidden"
                            onClick={() => setShowFilters(!showFilters)}
                            style={{ borderColor: '#1E293B', color: '#1E293B' }}
                        >
                            <svg
                                className="w-5 h-5"
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
                            {t('common.filter') || 'Filter'}
                        </button>
                        {/* View Mode Toggle */}
                        <div className="btn-group">
                            <button
                                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                style={{ backgroundColor: viewMode === 'grid' ? '#1E293B' : 'transparent', color: viewMode === 'grid' ? '#ffffff' : '#1E293B' }}
                            >
                                <svg
                                    className="w-5 h-5"
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
                                style={{ backgroundColor: viewMode === 'list' ? '#1E293B' : 'transparent', color: viewMode === 'list' ? '#ffffff' : '#1E293B' }}
                            >
                                <svg
                                    className="w-5 h-5"
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

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
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
                                {pagination.totalPages > 1 && (
                                    <Pagination
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        totalItems={pagination.totalItems}
                                        itemsPerPage={pagination.itemsPerPage}
                                        onPageChange={changePage}
                                        onItemsPerPageChange={changeItemsPerPage}
                                    />
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

