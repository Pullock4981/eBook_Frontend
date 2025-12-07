/**
 * Admin Product Edit Page
 * 
 * Edit existing product
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, selectCurrentProduct, selectIsLoading, clearCurrentProduct } from '../../../store/slices/productSlice';
import { updateProduct } from '../../../services/adminService';
import { fetchProducts } from '../../../store/slices/productSlice';
import ProductForm from '../../../components/admin/ProductForm';
import Loading from '../../../components/common/Loading';

function ProductEdit() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const product = useSelector(selectCurrentProduct);
    const isLoading = useSelector(selectIsLoading);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById({ id, incrementViews: false }));
        }

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, id]);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await updateProduct(id, formData);
            // Refresh products list
            dispatch(fetchProducts({ filters: {}, page: 1, limit: 12 }));
            // Navigate to products list
            navigate('/admin/products');
        } catch (error) {
            alert(error.message || t('admin.updateError') || 'Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loading />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-base opacity-70" style={{ color: '#2d3748' }}>
                    {t('admin.productNotFound') || 'Product not found'}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="w-full">
                {/* Header */}
                <div className="mb-4 sm:mb-6 lg:mb-8 px-3 sm:px-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-1 h-8 sm:h-10 rounded-full" style={{ backgroundColor: '#1E293B' }}></div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: '#1E293B' }}>
                            {t('admin.editProduct') || 'Edit Product'}
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg opacity-70 ml-3 sm:ml-4" style={{ color: '#2d3748' }}>
                        {t('admin.editProductDescription') || 'Update product information'}
                    </p>
                </div>

                {/* Product Form */}
                <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-0">
                    <ProductForm
                        product={product}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isSubmitting}
                    />
                </div>
            </div>
        </div>
    );
}

export default ProductEdit;

