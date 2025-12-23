/**
 * Admin Coupon Create Page
 * 
 * Create new coupon
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { createCoupon, fetchAllCoupons } from '../../../store/slices/couponSlice';
import CouponForm from '../../../components/admin/CouponForm';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { showError, showSuccess } from '../../../utils/toast';

function CouponCreate() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        try {
            await dispatch(createCoupon(formData)).unwrap();
            showSuccess(t('admin.couponCreated') || 'Coupon created successfully!');
            // Refresh coupons list
            dispatch(fetchAllCoupons({ page: 1, limit: 10 }));
            // Navigate to coupons list
            navigate('/admin/coupons');
        } catch (error) {
            showError(error || t('admin.createError') || 'Failed to create coupon');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/coupons');
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
                            {t('admin.createCoupon') || 'Create Coupon'}
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-70" style={{ color: secondaryTextColor }}>
                            {t('admin.createCouponDescription') || 'Add a new discount coupon'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Coupon Form */}
            <div className="w-full max-w-3xl mx-auto px-2 sm:px-3 md:px-4 lg:px-0">
                <CouponForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}

export default CouponCreate;

