/**
 * Product List Component
 * 
 * Displays a list of products in grid or list view
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import Loading from '../common/Loading';

function ProductList({ products, isLoading, viewMode = 'grid' }) {
    const { t } = useTranslation();

    // Debug log in development
    if (import.meta.env.DEV) {
        console.log('ProductList - Products count:', products?.length || 0);
        console.log('ProductList - Products:', products);
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loading />
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#1E293B' }}>
                    {t('products.noProducts') || 'No Products Found'}
                </h3>
                <p className="text-base opacity-70" style={{ color: '#2d3748' }}>
                    {t('products.noProductsDescription') || 'Try adjusting your filters or search terms.'}
                </p>
            </div>
        );
    }

    // Grid view
    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                ))}
            </div>
        );
    }

    // List view
    return (
        <div className="space-y-4">
            {products.map((product) => (
                <div key={product._id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Image */}
                            <div className="w-full sm:w-32 h-48 sm:h-32 flex-shrink-0">
                                <img
                                    src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                    loading="lazy"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E293B' }}>
                                    {product.name}
                                </h3>
                                {product.description && (
                                    <p className="text-sm opacity-70 line-clamp-2 mb-2" style={{ color: '#2d3748' }}>
                                        {product.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-lg font-bold" style={{ color: '#1E293B' }}>
                                            {product.discountPrice || product.price} ৳
                                        </span>
                                        {product.discountPrice && (
                                            <span className="text-sm line-through opacity-50 ml-2" style={{ color: '#2d3748' }}>
                                                {product.price} ৳
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        to={`/products/${product._id}`}
                                        className="btn btn-sm btn-primary text-white"
                                        style={{ backgroundColor: '#1E293B' }}
                                    >
                                        {t('products.viewDetails') || 'View Details'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProductList;

