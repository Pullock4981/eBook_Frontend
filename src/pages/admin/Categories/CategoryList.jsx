/**
 * Admin Category List Page
 * 
 * List all categories with add and delete functionality
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategories, createCategory, deleteCategory } from '../../../services/adminService';
import Loading from '../../../components/common/Loading';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { showError, showSuccess } from '../../../utils/toast';
import Swal from 'sweetalert2';

function CategoryList() {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor } = useThemeColors();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);

    // Form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getCategories();
            if (response?.success && response?.data) {
                setCategories(response.data);
            } else {
                setCategories(response || []);
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch categories');
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            showError('Category name is required');
            return;
        }

        setCreateLoading(true);
        try {
            await createCategory(formData);
            // Reset form
            setFormData({
                name: '',
                description: '',
                isActive: true
            });
            setShowAddForm(false);
            showSuccess('Category created successfully!');
            // Refresh categories
            await fetchCategories();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to create category');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this category?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        setDeleteLoading(id);
        try {
            await deleteCategory(id);
            showSuccess('Category deleted successfully!');
            // Refresh categories
            await fetchCategories();
        } catch (error) {
            showError(error.response?.data?.message || error.message || 'Failed to delete category');
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-8">
                <div className="space-y-5 sm:space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-4 bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold truncate mb-1" style={{ color: primaryTextColor }}>
                                {t('nav.categoryManagement') || 'Category Management'}
                            </h1>
                            <p className="text-sm opacity-70" style={{ color: secondaryTextColor }}>
                                Manage all product categories
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
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
                            <span className="ml-1.5">{showAddForm ? 'Cancel' : '+ Add Category'}</span>
                        </button>
                    </div>

                    {/* Add Category Form */}
                    {showAddForm && (
                        <div className="bg-base-100 rounded-lg shadow-sm border p-4 sm:p-5" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <h2 className="text-lg font-semibold mb-4" style={{ color: primaryTextColor }}>Add New Category</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: primaryTextColor }}>
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter category name"
                                        className="input input-bordered w-full border-2 px-4 py-2.5"
                                        style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor, paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: primaryTextColor }}>
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter category description (optional)"
                                        rows="3"
                                        className="textarea textarea-bordered w-full border-2 px-4 py-2.5"
                                        style={{ borderColor: secondaryTextColor, backgroundColor, color: primaryTextColor, paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="checkbox checkbox-sm"
                                    />
                                    <label className="text-sm font-medium" style={{ color: primaryTextColor }}>
                                        Active
                                    </label>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="btn btn-primary text-white px-5 py-2.5 font-medium transition-all duration-200 hover:shadow-md"
                                        style={{ backgroundColor: buttonColor, paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                                    >
                                        {createLoading ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                <span>Creating...</span>
                                            </>
                                        ) : (
                                            'Create Category'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setFormData({
                                                name: '',
                                                description: '',
                                                isActive: true
                                            });
                                        }}
                                        className="btn btn-outline px-5 py-2.5 font-medium"
                                        style={{ borderColor: buttonColor, color: primaryTextColor, backgroundColor, paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = backgroundColor;
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Categories Table or Empty State */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loading />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="bg-base-100 rounded-lg shadow-sm border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
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
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: primaryTextColor }}>
                                        No Categories Found
                                    </h3>
                                    <p className="text-sm sm:text-base opacity-70 mb-4 sm:mb-6 px-4" style={{ color: secondaryTextColor }}>
                                        Add your first category to get started!
                                    </p>
                                    <button
                                        onClick={() => setShowAddForm(true)}
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
                                        Add Category
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-base-100 rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr style={{ backgroundColor: buttonColor }}>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Name</th>
                                            <th className="hidden md:table-cell text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Description</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Status</th>
                                            <th className="text-xs sm:text-sm font-semibold py-3 px-4" style={{ color: '#ffffff' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr key={category._id || category.id} className="transition-colors border-b" style={{ borderColor: secondaryTextColor }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-sm" style={{ color: primaryTextColor }}>
                                                        {category.name}
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell py-3 px-4">
                                                    <span className="text-xs sm:text-sm opacity-70 line-clamp-2" style={{ color: secondaryTextColor }}>
                                                        {category.description || '-'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`badge badge-xs px-2 py-0.5 ${category.isActive ? 'badge-success' : 'badge-error'}`}>
                                                        {category.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleDelete(category._id || category.id)}
                                                        className="btn btn-sm text-white px-4 py-2"
                                                        style={{ backgroundColor: errorColor || '#dc2626', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                                                        disabled={deleteLoading === (category._id || category.id)}
                                                    >
                                                        {deleteLoading === (category._id || category.id) ? (
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
                                                                <span className="hidden sm:inline ml-1">Delete</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CategoryList;

