/**
 * Admin Product List Page
 * 
 * List all products with search, filters, and actions
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectProducts, selectPagination, selectIsLoading, selectError } from '../../../store/slices/productSlice';
import { createProduct, deleteProduct } from '../../../services/adminService';
import { formatCurrency } from '../../../utils/helpers';
import { PRODUCT_TYPES } from '../../../utils/constants';
import Loading from '../../../components/common/Loading';
import Pagination from '../../../components/common/Pagination';

function ProductList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const products = useSelector(selectProducts);
    const pagination = useSelector(selectPagination);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        // Admin can see all products including inactive ones
        dispatch(fetchProducts({ filters: { includeInactive: true }, page: 1, limit: 12 }));
    }, [dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        // Search will be implemented with backend
        dispatch(fetchProducts({ filters: { search: searchQuery, includeInactive: true }, page: 1, limit: 12 }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.confirmDelete') || 'Are you sure you want to delete this product?')) {
            return;
        }

        setDeleteLoading(id);
        try {
            await deleteProduct(id);
            // Refresh list - include inactive products for admin
            dispatch(fetchProducts({ filters: { includeInactive: true }, page: pagination.currentPage, limit: pagination.itemsPerPage }));
        } catch (error) {
            alert(error.message || t('admin.deleteError') || 'Failed to delete product');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handlePageChange = (page) => {
        dispatch(fetchProducts({ filters: { includeInactive: true }, page, limit: pagination.itemsPerPage }));
    };

    const handleItemsPerPageChange = (limit) => {
        dispatch(fetchProducts({ filters: { includeInactive: true }, page: 1, limit }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-row justify-between items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate" style={{ color: '#1E293B' }}>
                        {t('admin.products') || 'Products'}
                    </h1>
                    <p className="text-xs sm:text-sm opacity-70 mt-0.5 sm:mt-1 hidden sm:block" style={{ color: '#2d3748' }}>
                        {t('admin.manageProducts') || 'Manage all products'}
                    </p>
                </div>
                <Link
                    to="/admin/products/create"
                    className="btn btn-primary text-white btn-sm sm:btn-md flex-shrink-0"
                    style={{ backgroundColor: '#1E293B' }}
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
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <span>{t('admin.addProduct') || 'Add Product'}</span>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="card bg-base-100 shadow-sm border-2 p-3 sm:p-4" style={{ borderColor: '#e2e8f0' }}>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <input
                        type="text"
                        placeholder={t('admin.searchProducts') || 'Search products...'}
                        className="input input-bordered flex-grow border-2 text-sm sm:text-base"
                        style={{ borderColor: '#cbd5e1' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary text-white px-4 sm:px-6 text-sm sm:text-base font-semibold"
                        style={{ backgroundColor: '#1E293B' }}
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
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <span>{t('common.search') || 'Search'}</span>
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
            )}

            {/* Products Table or Empty State */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loading />
                </div>
            ) : products.length === 0 ? (
                /* Empty State - No Table */
                <div className="card bg-base-100 shadow-sm">
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: '#f1f5f9' }}>
                            <svg
                                className="w-10 h-10 sm:w-12 sm:h-12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: '#94a3b8' }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: '#1E293B' }}>
                                {t('admin.noBooks') || 'No Books Found'}
                            </h3>
                            <p className="text-sm sm:text-base opacity-70 mb-4 sm:mb-6 px-4" style={{ color: '#2d3748' }}>
                                {t('admin.noBooksMessage') || 'You haven\'t added any books yet. Start by adding your first book!'}
                            </p>
                            <Link
                                to="/admin/products/create"
                                className="btn btn-primary text-white inline-flex items-center gap-2 btn-sm sm:btn-md"
                                style={{ backgroundColor: '#1E293B' }}
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
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                {t('admin.addProduct') || 'Add Product'}
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                /* Products Table - Only show when products exist */
                <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="bg-base-200">
                                    <th className="hidden sm:table-cell">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={selectedProducts.length === products.length && products.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProducts(products.map(p => p._id));
                                                } else {
                                                    setSelectedProducts([]);
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="text-xs sm:text-sm font-semibold" style={{ color: '#1E293B' }}>{t('admin.image') || 'Image'}</th>
                                    <th className="text-xs sm:text-sm font-semibold" style={{ color: '#1E293B' }}>{t('admin.name') || 'Name'}</th>
                                    <th className="hidden md:table-cell text-xs sm:text-sm font-semibold" style={{ color: '#1E293B' }}>{t('admin.type') || 'Type'}</th>
                                    <th className="hidden lg:table-cell text-xs sm:text-sm font-semibold" style={{ color: '#1E293B' }}>{t('admin.category') || 'Category'}</th>
                                    <th className="text-xs sm:text-sm font-semibold" style={{ color: '#1E293B' }}>{t('admin.price') || 'Price'}</th>
                                    <th className="hidden md:table-cell text-xs sm:text-sm font-semibold" style={{ color: '#1E293B' }}>{t('admin.stock') || 'Stock'}</th>
                                    <th className="hidden lg:table-cell text-xs sm:text-sm font-semibold" style={{ color: '#1E293B' }}>{t('admin.status') || 'Status'}</th>
                                    <th className="text-xs sm:text-sm font-semibold" style={{ color: '#1E293B' }}>{t('admin.actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-base-200 transition-colors">
                                        <th className="hidden sm:table-cell">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-sm"
                                                checked={selectedProducts.includes(product._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedProducts([...selectedProducts, product._id]);
                                                    } else {
                                                        setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                                                    }
                                                }}
                                            />
                                        </th>
                                        <td>
                                            <div className="avatar">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden">
                                                    <img
                                                        src={product.images?.[0] || 'https://via.placeholder.com/100?text=No+Image'}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-medium text-xs sm:text-sm" style={{ color: '#1E293B' }}>
                                                <div className="line-clamp-1">{product.name}</div>
                                                <div className="md:hidden mt-1">
                                                    <span className={`badge badge-xs ${product.type === PRODUCT_TYPES.PHYSICAL ? 'badge-primary' : 'badge-secondary'}`}>
                                                        {product.type === PRODUCT_TYPES.PHYSICAL ? t('products.physical') : t('products.digital')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell">
                                            <span className={`badge badge-sm ${product.type === PRODUCT_TYPES.PHYSICAL ? 'badge-primary' : 'badge-secondary'}`}>
                                                {product.type === PRODUCT_TYPES.PHYSICAL ? t('products.physical') : t('products.digital')}
                                            </span>
                                        </td>
                                        <td className="hidden lg:table-cell">
                                            <span className="text-xs sm:text-sm opacity-70">{product.category?.name || '-'}</span>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="font-medium text-xs sm:text-sm" style={{ color: '#1E293B' }}>
                                                    {formatCurrency(product.discountPrice || product.price)}
                                                </div>
                                                {product.discountPrice && (
                                                    <div className="text-xs line-through opacity-50">
                                                        {formatCurrency(product.price)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell">
                                            {product.type === PRODUCT_TYPES.PHYSICAL ? (
                                                <span className={`text-xs sm:text-sm font-medium ${product.stock > 0 ? 'text-success' : 'text-error'}`}>
                                                    {product.stock || 0}
                                                </span>
                                            ) : (
                                                <span className="text-xs opacity-50">-</span>
                                            )}
                                        </td>
                                        <td className="hidden lg:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <span className={`badge badge-xs ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                                                    {product.isActive ? t('admin.active') : t('admin.inactive')}
                                                </span>
                                                {product.isFeatured && (
                                                    <span className="badge badge-xs badge-warning">
                                                        {t('admin.featured')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <Link
                                                    to={`/products/${product._id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-primary text-white flex-1 sm:flex-initial"
                                                    style={{ backgroundColor: '#1E293B' }}
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                    <span className="hidden sm:inline">{t('common.view') || 'View'}</span>
                                                </Link>
                                                <Link
                                                    to={`/admin/products/${product._id}/edit`}
                                                    className="btn btn-sm btn-outline flex-1 sm:flex-initial"
                                                    style={{ borderColor: '#1E293B', color: '#1E293B' }}
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                    <span className="hidden sm:inline">{t('common.edit') || 'Edit'}</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="btn btn-sm text-white flex-1 sm:flex-initial"
                                                    style={{ backgroundColor: '#dc2626' }}
                                                    disabled={deleteLoading === product._id}
                                                >
                                                    {deleteLoading === product._id ? (
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                    ) : (
                                                        <>
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                            <span className="hidden sm:inline">{t('common.delete') || 'Delete'}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}
        </div>
    );
}

export default ProductList;

