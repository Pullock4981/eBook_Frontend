/**
 * Categories Page
 * 
 * Display all categories with their products
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMainCategories, selectMainCategories, selectCategoriesLoading, selectCategoriesError } from '../store/slices/categorySlice';
import Loading from '../components/common/Loading';

function Categories() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const categories = useSelector(selectMainCategories);
    const isLoading = useSelector(selectCategoriesLoading);
    const error = useSelector(selectCategoriesError);

    useEffect(() => {
        dispatch(fetchMainCategories());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFECE3' }}>
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EFECE3' }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('categories.error') || 'Error Loading Categories'}
                    </h2>
                    <p className="text-base opacity-70" style={{ color: '#2d3748' }}>
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('nav.categories') || 'Categories'}
                    </h1>
                    <p className="text-base opacity-70" style={{ color: '#2d3748' }}>
                        {t('categories.description') || 'Browse books by category'}
                    </p>
                </div>

                {/* Categories Grid */}
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: '#1E293B' }}>
                            {t('categories.noCategories') || 'No Categories Found'}
                        </h3>
                        <p className="text-base opacity-70" style={{ color: '#2d3748' }}>
                            {t('categories.noCategoriesDescription') || 'Categories will appear here once they are added.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category._id}
                                to={`/products?category=${category._id}`}
                                className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="card-body items-center text-center p-6">
                                    <div className="text-6xl mb-4">📖</div>
                                    <h2 className="card-title text-lg font-semibold" style={{ color: '#1E293B' }}>
                                        {category.name}
                                    </h2>
                                    {category.description && (
                                        <p className="text-sm opacity-70 line-clamp-2 mt-2" style={{ color: '#2d3748' }}>
                                            {category.description}
                                        </p>
                                    )}
                                    <div className="card-actions mt-4">
                                        <button
                                            className="btn btn-sm btn-primary text-white"
                                            style={{ backgroundColor: '#1E293B' }}
                                        >
                                            {t('categories.viewProducts') || 'View Products'}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Categories;

