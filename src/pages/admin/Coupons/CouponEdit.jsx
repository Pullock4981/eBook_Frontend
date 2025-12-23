/**
 * Admin Coupon Edit Page
 * 
 * Edit existing coupon
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCouponById, updateCoupon, fetchAllCoupons, selectCurrentCoupon, selectCouponLoading } from '../../../store/slices/couponSlice';
import CouponForm from '../../../components/admin/CouponForm';
import Loading from '../../../components/common/Loading';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { showError, showSuccess } from '../../../utils/toast';

function CouponEdit() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();

    const coupon = useSelector(selectCurrentCoupon);
    const isLoadingCoupon = useSelector(selectCouponLoading);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchCouponById(id));
        }
    }, [dispatch, id]);

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            await dispatch(updateCoupon({ id, couponData: formData })).unwrap();
            showSuccess(t('admin.couponUpdated') || 'Coupon updated successfully!');
            // Refresh coupons list
            dispatch(fetchAllCoupons({ page: 1, limit: 10 }));
            // Navigate to coupons list
            navigate('/admin/coupons');
        } catch (error) {
            showError(error || t('admin.updateError') || 'Failed to update coupon');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/coupons');
    };

    if (isLoadingCoupon) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loading />
            </div>
        );
    }

    if (!coupon) {
        return (
            <div className="text-center py-12" style={{ backgroundColor }}>
                <p className="text-lg" style={{ color: primaryTextColor }}>
                    {t('admin.couponNotFound') || 'Coupon not found'}
                </p>
            </div>
        );
    }

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
                            {t('admin.editCoupon') || 'Edit Coupon'}
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-70" style={{ color: secondaryTextColor }}>
                            {t('admin.editCouponDescription') || 'Update coupon details'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Coupon Form */}
            <div className="w-full max-w-3xl mx-auto px-2 sm:px-3 md:px-4 lg:px-0">
                <CouponForm
                    initialData={coupon}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={isSubmitting}
                />
            </div>
        </div>
    );
}

export default CouponEdit;

