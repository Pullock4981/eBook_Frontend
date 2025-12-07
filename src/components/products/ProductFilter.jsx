/**
 * Product Filter Component
 * 
 * Sidebar filter for products (Category, Price, Type, etc.)
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters, fetchProducts } from '../../store/slices/productSlice';
import { selectFilters } from '../../store/slices/productSlice';
import { selectMainCategories } from '../../store/slices/categorySlice';
import { fetchMainCategories } from '../../store/slices/categorySlice';
import { PRODUCT_TYPES } from '../../utils/constants';

function ProductFilter({ onFilterChange }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);
    const categories = useSelector(selectMainCategories);

    const [localFilters, setLocalFilters] = useState(filters);
    const [priceRange, setPriceRange] = useState({
        min: filters.minPrice || '',
        max: filters.maxPrice || '',
    });

    // Fetch categories on mount
    useEffect(() => {
        dispatch(fetchMainCategories());
    }, [dispatch]);

    // Update local filters when Redux filters change
    useEffect(() => {
        setLocalFilters(filters);
        setPriceRange({
            min: filters.minPrice || '',
            max: filters.maxPrice || '',
        });
    }, [filters]);

    // Handle filter change
    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        dispatch(setFilters(newFilters));
        // Trigger filter update in parent
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    // Handle price range change
    const handlePriceChange = (type, value) => {
        const newPriceRange = { ...priceRange, [type]: value };
        setPriceRange(newPriceRange);
        handleFilterChange('minPrice', newPriceRange.min);
        handleFilterChange('maxPrice', newPriceRange.max);
    };

    // Clear all filters
    const handleClearFilters = () => {
        setLocalFilters({
            type: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            isFeatured: undefined, // Changed to undefined to show all products
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
        setPriceRange({ min: '', max: '' });
        dispatch(clearFilters());
        if (onFilterChange) onFilterChange({});
    };

    return (
        <div className="bg-base-100 p-4 sm:p-6 rounded-lg shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#1E293B' }}>
                    {t('products.filters') || 'Filters'}
                </h3>
                <button
                    onClick={handleClearFilters}
                    className="btn btn-ghost btn-sm text-xs"
                    style={{ color: '#1E293B' }}
                >
                    {t('common.clear') || 'Clear'}
                </button>
            </div>

            <div className="space-y-6">
                {/* Product Type Filter */}
                <div>
                    <label className="label">
                        <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                            {t('products.productType') || 'Product Type'}
                        </span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={localFilters.type || ''}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        style={{ borderColor: '#e2e8f0', color: '#1E293B' }}
                    >
                        <option value="">{t('products.allTypes') || 'All Types'}</option>
                        <option value={PRODUCT_TYPES.PHYSICAL}>
                            {t('products.physical') || 'Physical'}
                        </option>
                        <option value={PRODUCT_TYPES.DIGITAL}>
                            {t('products.digital') || 'Digital'}
                        </option>
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="label">
                        <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                            {t('products.category') || 'Category'}
                        </span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={localFilters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        style={{ borderColor: '#e2e8f0', color: '#1E293B' }}
                    >
                        <option value="">{t('products.allCategories') || 'All Categories'}</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Range Filter */}
                <div>
                    <label className="label">
                        <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                            {t('products.priceRange') || 'Price Range'}
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder={t('products.minPrice') || 'Min'}
                            className="input input-bordered w-full"
                            value={priceRange.min}
                            onChange={(e) => handlePriceChange('min', e.target.value)}
                            style={{ borderColor: '#e2e8f0', color: '#1E293B' }}
                        />
                        <input
                            type="number"
                            placeholder={t('products.maxPrice') || 'Max'}
                            className="input input-bordered w-full"
                            value={priceRange.max}
                            onChange={(e) => handlePriceChange('max', e.target.value)}
                            style={{ borderColor: '#e2e8f0', color: '#1E293B' }}
                        />
                    </div>
                </div>

                {/* Featured Products Filter */}
                <div>
                    <label className="label">
                        <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                            {t('products.showProducts') || 'Show Products'}
                        </span>
                    </label>
                    <div className="space-y-2">
                        <label className="label cursor-pointer p-3 rounded-lg border-2 hover:bg-base-200 transition-colors" style={{ borderColor: localFilters.isFeatured === undefined || localFilters.isFeatured === false ? '#1E293B' : '#e2e8f0' }}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="featuredFilter"
                                    className="radio radio-primary"
                                    checked={localFilters.isFeatured === undefined || localFilters.isFeatured === false}
                                    onChange={() => handleFilterChange('isFeatured', undefined)}
                                    style={{ accentColor: '#1E293B' }}
                                />
                                <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                                    {t('products.allProducts') || 'All Products'}
                                </span>
                            </div>
                        </label>
                        <label className="label cursor-pointer p-3 rounded-lg border-2 hover:bg-base-200 transition-colors" style={{ borderColor: localFilters.isFeatured === true ? '#1E293B' : '#e2e8f0' }}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="featuredFilter"
                                    className="radio radio-primary"
                                    checked={localFilters.isFeatured === true}
                                    onChange={() => handleFilterChange('isFeatured', true)}
                                    style={{ accentColor: '#1E293B' }}
                                />
                                <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                                    {t('products.featuredOnly') || 'Featured Only'}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Sort By */}
                <div>
                    <label className="label">
                        <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                            {t('products.sortBy') || 'Sort By'}
                        </span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={localFilters.sortBy || 'createdAt'}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        style={{ borderColor: '#e2e8f0', color: '#1E293B' }}
                    >
                        <option value="createdAt">{t('products.newest') || 'Newest First'}</option>
                        <option value="price">{t('products.price') || 'Price'}</option>
                        <option value="name">{t('products.name') || 'Name'}</option>
                        <option value="views">{t('products.mostViewed') || 'Most Viewed'}</option>
                    </select>
                </div>

                {/* Sort Order */}
                <div>
                    <label className="label">
                        <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                            {t('products.sortOrder') || 'Order'}
                        </span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={localFilters.sortOrder || 'desc'}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        style={{ borderColor: '#e2e8f0', color: '#1E293B' }}
                    >
                        <option value="desc">{t('products.descending') || 'Descending'}</option>
                        <option value="asc">{t('products.ascending') || 'Ascending'}</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default ProductFilter;

