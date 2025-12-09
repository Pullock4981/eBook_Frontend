/**
 * Admin Product List Page
 * 
 * List all products with search, filters, and actions
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, clearError, selectProducts, selectPagination, selectIsLoading, selectError } from '../../../store/slices/productSlice';
import { createProduct, deleteProduct } from '../../../services/adminService';
import { formatCurrency } from '../../../utils/helpers';
import { PRODUCT_TYPES } from '../../../utils/constants';
import Loading from '../../../components/common/Loading';
import Pagination from '../../../components/common/Pagination';
import { useThemeColors } from '../../../hooks/useThemeColors';

function ProductList() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor } = useThemeColors();

    const products = useSelector(selectProducts);
    const pagination = useSelector(selectPagination);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    const [searchQuery, setSearchQuery] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        // Admin can see all products including inactive ones
        // Use limit 100 to show all products
        dispatch(fetchProducts({ filters: { includeInactive: true }, page: 1, limit: 100 }));
    }, [dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        // Search will be implemented with backend
        dispatch(fetchProducts({ filters: { search: searchQuery, includeInactive: true }, page: 1, limit: 100 }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('admin.confirmDelete') || 'Are you sure you want to delete this product?')) {
            return;
        }

        setDeleteLoading(id);
        try {
            await deleteProduct(id);
            // Refresh list - include inactive products for admin
            dispatch(fetchProducts({ filters: { includeInactive: true }, page: pagination.currentPage, limit: 100 }));
        } catch (error) {
            alert(error.message || t('admin.deleteError') || 'Failed to delete product');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handlePageChange = (page) => {
        dispatch(fetchProducts({ filters: { includeInactive: true }, page, limit: 100 }));
    };

    const handleItemsPerPageChange = (limit) => {
        dispatch(fetchProducts({ filters: { includeInactive: true }, page: 1, limit: 100 }));
    };

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                <div className="space-y-5 sm:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-4 bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold truncate mb-1" style={{ color: primaryTextColor }}>
                                {t('nav.productManagement') || 'Product Management'}
                            </h1>
                            <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                {t('admin.manageProducts') || 'Manage all products'}
                            </p>
                        </div>
                        <Link
                            to="/admin/products/create"
                            className="btn btn-primary text-white btn-sm sm:btn-md flex-shrink-0 px-4 py-2.5 font-medium transition-all duration-200 hover:shadow-md"
                            style={{ backgroundColor: buttonColor, paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
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
                            <span className="ml-1.5">{t('admin.addProduct') || '+ Add Product'}</span>
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <input
                                type="text"
                                placeholder={t('admin.searchProducts') || 'Search products...'}
                                className="input input-bordered flex-grow border-2 text-sm sm:text-base px-4 py-2.5"
                                style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor, paddingLeft: '1rem', paddingRight: '1rem' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary text-white px-5 sm:px-6 py-2.5 text-sm sm:text-base font-medium transition-all duration-200 hover:shadow-md"
                                style={{ backgroundColor: buttonColor, paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
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
                        <div className="rounded-lg p-4 mb-4 border-l-4" style={{ backgroundColor: errorColor ? errorColor + '20' : '#fee2e2', borderColor: errorColor || '#ef4444' }}>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: errorColor || '#ef4444' }}>
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-sm font-medium mb-1" style={{ color: errorColor || '#991b1b' }}>
                                        {t('admin.error') || 'Error'}
                                    </h3>
                                    <p className="text-sm mb-3" style={{ color: errorColor || '#991b1b' }}>
                                        {error}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                dispatch(fetchProducts({ filters: { includeInactive: true }, page: 1, limit: 100 }));
                                            }}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white transition-colors"
                                            style={{ backgroundColor: errorColor || '#ef4444' }}
                                        >
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            {t('common.retry') || 'Retry'}
                                        </button>
                                        <button
                                            onClick={() => dispatch(clearError())}
                                            className="inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md transition-colors"
                                            style={{ borderColor: errorColor || '#ef4444', color: errorColor || '#991b1b', backgroundColor }}
                                        >
                                            {t('common.dismiss') || 'Dismiss'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Table or Empty State */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loading />
                        </div>
                    ) : products.length === 0 ? (
                        /* Empty State - No Table */
                        <div className="card bg-base-100 shadow-sm border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ backgroundColor: secondaryTextColor + '20' }}>
                                    <svg
                                        className="w-10 h-10 sm:w-12 sm:h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        style={{ color: secondaryTextColor }}
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
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: primaryTextColor }}>
                                        {t('admin.noBooks') || 'No Books Found'}
                                    </h3>
                                    <p className="text-sm sm:text-base opacity-70 mb-4 sm:mb-6 px-4" style={{ color: secondaryTextColor }}>
                                        {t('admin.noBooksMessage') || 'You haven\'t added any books yet. Start by adding your first book!'}
                                    </p>
                                    <Link
                                        to="/admin/products/create"
                                        className="btn btn-primary text-white inline-flex items-center gap-2 btn-sm sm:btn-md"
                                        style={{ backgroundColor: buttonColor }}
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
                        <div className="bg-base-100 rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: buttonColor }}>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('admin.image') || 'Image'}</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('admin.name') || 'Name'}</th>
                                            <th className="hidden md:table-cell text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('admin.type') || 'Type'}</th>
                                            <th className="hidden lg:table-cell text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('admin.category') || 'Category'}</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('admin.price') || 'Price'}</th>
                                            <th className="hidden md:table-cell text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('admin.stock') || 'Stock'}</th>
                                            <th className="hidden lg:table-cell text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('admin.status') || 'Status'}</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>{t('admin.actions') || 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product._id} className="transition-colors border-b" style={{ borderColor: secondaryTextColor }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="avatar">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden border" style={{ borderColor: secondaryTextColor }}>
                                                            <img
                                                                src={product.images?.[0] || 'https://via.placeholder.com/100?text=No+Image'}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-xs sm:text-sm" style={{ color: primaryTextColor }}>
                                                        <div className="line-clamp-1">{product.name}</div>
                                                        <div className="md:hidden mt-1">
                                                            <span
                                                                className="badge badge-xs px-2 py-0.5 font-medium"
                                                                style={product.type === PRODUCT_TYPES.PHYSICAL ? { backgroundColor: buttonColor, color: '#ffffff', border: 'none' } : { backgroundColor: secondaryTextColor, color: '#ffffff', border: 'none' }}
                                                            >
                                                                {product.type === PRODUCT_TYPES.PHYSICAL ? t('products.physical') : t('products.digital')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell py-3 px-4">
                                                    <span
                                                        className="badge badge-sm px-2 py-1 font-medium"
                                                        style={product.type === PRODUCT_TYPES.PHYSICAL ? { backgroundColor: buttonColor, color: '#ffffff', border: 'none' } : { backgroundColor: secondaryTextColor, color: '#ffffff', border: 'none' }}
                                                    >
                                                        {product.type === PRODUCT_TYPES.PHYSICAL ? t('products.physical') : t('products.digital')}
                                                    </span>
                                                </td>
                                                <td className="hidden lg:table-cell py-3 px-4">
                                                    <span className="text-xs sm:text-sm opacity-70" style={{ color: secondaryTextColor }}>{product.category?.name || '-'}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <div className="font-medium text-xs sm:text-sm" style={{ color: primaryTextColor }}>
                                                            {formatCurrency(product.discountPrice || product.price)}
                                                        </div>
                                                        {product.discountPrice && (
                                                            <div className="text-xs line-through opacity-50" style={{ color: secondaryTextColor }}>
                                                                {formatCurrency(product.price)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell py-3 px-4">
                                                    {product.type === PRODUCT_TYPES.PHYSICAL ? (
                                                        <span className={`text-xs sm:text-sm font-medium ${product.stock > 0 ? 'text-success' : 'text-error'}`}>
                                                            {product.stock || 0}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs opacity-50">-</span>
                                                    )}
                                                </td>
                                                <td className="hidden lg:table-cell py-3 px-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`badge badge-xs px-2 py-0.5 ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                                                            {product.isActive ? t('admin.active') : t('admin.inactive')}
                                                        </span>
                                                        {product.isFeatured && (
                                                            <span className="badge badge-xs badge-warning px-2 py-0.5">
                                                                {t('admin.featured')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <Link
                                                            to={`/products/${product._id}`}
                                                            className="btn btn-sm btn-primary text-white flex-1 sm:flex-initial px-3 py-1.5 font-medium transition-all duration-200 hover:shadow-sm"
                                                            style={{ backgroundColor: buttonColor, paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
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
                                                            className="btn btn-sm btn-outline flex-1 sm:flex-initial px-3 py-1.5 font-medium transition-all duration-200 hover:shadow-sm"
                                                            style={{ borderColor: buttonColor, color: primaryTextColor, backgroundColor, paddingLeft: '0.75rem', paddingRight: '0.75rem', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = backgroundColor;
                                                            }}
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
                                                            className="btn btn-sm text-white flex-1 sm:flex-initial px-4 py-2"
                                                            style={{ backgroundColor: errorColor || '#dc2626', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
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
            </div>
        </div>
    );
}

export default ProductList;

