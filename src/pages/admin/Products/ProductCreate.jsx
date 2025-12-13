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
import { useThemeColors } from '../../../hooks/useThemeColors';

function ProductCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData) => {
        console.log('Product Create - Form Data:', formData);
        setIsLoading(true);
        try {
            const response = await createProduct(formData);
            console.log('Product Create - Success:', response);
            
            // Show success message
            alert(t('admin.productCreated') || 'Product created successfully!');
            
            // Refresh products list
            dispatch(fetchProducts({ filters: {}, page: 1, limit: 12 }));
            
            // Navigate to products list
            navigate('/admin/products');
        } catch (error) {
            console.error('Product Create - Error:', error);
            console.error('Error Details:', {
                message: error.message,
                response: error.response,
                data: error.data,
                status: error.status
            });
            
            // Better error message
            let errorMessage = error.message || t('admin.createError') || 'Failed to create product';
            
            if (error.data?.message) {
                errorMessage = error.data.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.status === 401) {
                errorMessage = 'Authentication failed. Please login again.';
            } else if (error.status === 403) {
                errorMessage = 'You do not have permission to create products. Admin access required.';
            } else if (error.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }
            
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    return (
        <div className="w-full pb-4" style={{ backgroundColor }}>
            {/* Header Section */}
            <div className="w-full mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                <div className="flex items-start gap-3 sm:gap-4 mb-2 px-3 sm:px-0">
                    {/* Vertical indicator */}
                    <div className="w-1 h-8 sm:h-10 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: buttonColor }}></div>
                    {/* Title and description */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2" style={{ color: primaryTextColor }}>
                            {t('admin.createProduct') || 'Create Product'}
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-70" style={{ color: secondaryTextColor }}>
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

