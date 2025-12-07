/**
 * Admin Product Create Page
 * 
 * Create new product
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { createProduct } from '../../../services/adminService';
import { fetchProducts } from '../../../store/slices/productSlice';
import ProductForm from '../../../components/admin/ProductForm';

function ProductCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await createProduct(formData);
            // Refresh products list
            dispatch(fetchProducts({ filters: {}, page: 1, limit: 12 }));
            // Navigate to products list
            navigate('/admin/products');
        } catch (error) {
            alert(error.message || t('admin.createError') || 'Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    return (
        <div className="w-full pb-4" style={{ backgroundColor: '#EFECE3' }}>
            {/* Header Section */}
            <div className="w-full mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                <div className="flex items-start gap-3 sm:gap-4 mb-2 px-3 sm:px-0">
                    {/* Vertical indicator */}
                    <div className="w-1 h-8 sm:h-10 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#1E293B' }}></div>
                    {/* Title and description */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2" style={{ color: '#1E293B' }}>
                            {t('admin.createProduct') || 'Create Product'}
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-70" style={{ color: '#2d3748' }}>
                            {t('admin.createProductDescription') || 'Add a new product to the store'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Product Form */}
            <div className="w-full max-w-5xl mx-auto px-2 sm:px-3 md:px-4 lg:px-0">
                <ProductForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

export default ProductCreate;

