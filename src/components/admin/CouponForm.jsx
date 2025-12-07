/**
 * Coupon Form Component
 * 
 * Form for creating and editing coupons
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/helpers';

function CouponForm({ initialData, onSubmit, onCancel, isLoading }) {
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        maxDiscount: '',
        minPurchase: '',
        usageLimit: '',
        expiryDate: '',
        isActive: true,
        description: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                code: initialData.code || '',
                type: initialData.type || 'percentage',
                value: initialData.value || '',
                maxDiscount: initialData.maxDiscount || '',
                minPurchase: initialData.minPurchase || '',
                usageLimit: initialData.usageLimit || '',
                expiryDate: initialData.expiryDate
                    ? new Date(initialData.expiryDate).toISOString().slice(0, 16)
                    : '',
                isActive: initialData.isActive !== undefined ? initialData.isActive : true,
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = t('admin.couponCodeRequired') || 'Coupon code is required';
        }

        if (!formData.value || formData.value <= 0) {
            newErrors.value = t('admin.couponValueRequired') || 'Coupon value is required and must be greater than 0';
        }

        if (formData.type === 'percentage' && formData.value > 100) {
            newErrors.value = t('admin.percentageMax100') || 'Percentage cannot exceed 100%';
        }

        if (formData.maxDiscount && formData.maxDiscount < 0) {
            newErrors.maxDiscount = t('admin.maxDiscountInvalid') || 'Max discount cannot be negative';
        }

        if (formData.minPurchase && formData.minPurchase < 0) {
            newErrors.minPurchase = t('admin.minPurchaseInvalid') || 'Minimum purchase cannot be negative';
        }

        if (!formData.usageLimit || formData.usageLimit < 1) {
            newErrors.usageLimit = t('admin.usageLimitRequired') || 'Usage limit is required and must be at least 1';
        }

        if (formData.expiryDate && new Date(formData.expiryDate) < new Date()) {
            newErrors.expiryDate = t('admin.expiryDateInvalid') || 'Expiry date cannot be in the past';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        const submitData = {
            code: formData.code.trim().toUpperCase(),
            type: formData.type,
            value: parseFloat(formData.value),
            usageLimit: parseInt(formData.usageLimit),
            isActive: formData.isActive,
            description: formData.description.trim() || undefined
        };

        // Add optional fields only if they have values
        if (formData.maxDiscount) {
            submitData.maxDiscount = parseFloat(formData.maxDiscount);
        }
        if (formData.minPurchase) {
            submitData.minPurchase = parseFloat(formData.minPurchase);
        }
        if (formData.expiryDate) {
            submitData.expiryDate = new Date(formData.expiryDate).toISOString();
        }

        onSubmit(submitData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: '#e2e8f0' }}>
            <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                    {/* Grid Layout for Large Devices */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                        {/* Code - Full Width */}
                        <div className="form-control lg:col-span-2">
                            <label className="label pb-2">
                                <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                    {t('admin.couponCode') || 'Coupon Code'} <span className="text-error">*</span>
                                </span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder={t('admin.enterCouponCode') || 'Enter coupon code (e.g., SAVE10)'}
                                className={`input input-bordered border-2 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 ${errors.code ? 'input-error' : ''}`}
                                style={{
                                    borderColor: errors.code ? '#ef4444' : '#cbd5e1',
                                    color: '#1E293B',
                                    paddingLeft: '1rem',
                                    paddingRight: '1rem',
                                    backgroundColor: '#ffffff'
                                }}
                                disabled={!!initialData}
                            />
                            {errors.code && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-xs sm:text-sm">{errors.code}</span>
                                </label>
                            )}
                        </div>

                        {/* Type */}
                        <div className="form-control">
                            <label className="label pb-2">
                                <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                    {t('admin.couponType') || 'Coupon Type'} <span className="text-error">*</span>
                                </span>
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="select select-bordered border-2 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3"
                                style={{ borderColor: '#cbd5e1', color: '#1E293B', backgroundColor: '#ffffff' }}
                            >
                                <option value="percentage">{t('admin.percentage') || 'Percentage'}</option>
                                <option value="fixed">{t('admin.fixed') || 'Fixed Amount'}</option>
                            </select>
                        </div>

                        {/* Value */}
                        <div className="form-control">
                            <label className="label pb-2">
                                <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                    {formData.type === 'percentage'
                                        ? t('admin.discountPercentage') || 'Discount Percentage'
                                        : t('admin.discountAmount') || 'Discount Amount'}{' '}
                                    <span className="text-error">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                    placeholder={formData.type === 'percentage' ? '10' : '100'}
                                    className={`input input-bordered border-2 text-sm sm:text-base w-full px-4 sm:px-5 py-2.5 sm:py-3 pr-10 ${errors.value ? 'input-error' : ''}`}
                                    style={{
                                        borderColor: errors.value ? '#ef4444' : '#cbd5e1',
                                        color: '#1E293B',
                                        backgroundColor: '#ffffff'
                                    }}
                                    min="0"
                                    step={formData.type === 'percentage' ? '0.01' : '1'}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm sm:text-base font-medium opacity-70" style={{ color: '#2d3748' }}>
                                    {formData.type === 'percentage' ? '%' : '৳'}
                                </span>
                            </div>
                            {errors.value && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-xs sm:text-sm">{errors.value}</span>
                                </label>
                            )}
                        </div>

                        {/* Max Discount (for percentage) */}
                        {formData.type === 'percentage' && (
                            <div className="form-control">
                                <label className="label pb-2">
                                    <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                        {t('admin.maxDiscount') || 'Maximum Discount'} ({t('admin.optional') || 'Optional'})
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                    placeholder="500"
                                    className={`input input-bordered border-2 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 ${errors.maxDiscount ? 'input-error' : ''}`}
                                    style={{
                                        borderColor: errors.maxDiscount ? '#ef4444' : '#cbd5e1',
                                        color: '#1E293B',
                                        backgroundColor: '#ffffff'
                                    }}
                                    min="0"
                                    step="1"
                                />
                                {errors.maxDiscount && (
                                    <label className="label pt-1">
                                        <span className="label-text-alt text-error text-xs sm:text-sm">{errors.maxDiscount}</span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Minimum Purchase */}
                        <div className="form-control">
                            <label className="label pb-2">
                                <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                    {t('admin.minimumPurchase') || 'Minimum Purchase'} ({t('admin.optional') || 'Optional'})
                                </span>
                            </label>
                            <input
                                type="number"
                                name="minPurchase"
                                value={formData.minPurchase}
                                onChange={handleChange}
                                placeholder="1000"
                                className={`input input-bordered border-2 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 ${errors.minPurchase ? 'input-error' : ''}`}
                                style={{
                                    borderColor: errors.minPurchase ? '#ef4444' : '#cbd5e1',
                                    color: '#1E293B',
                                    backgroundColor: '#ffffff'
                                }}
                                min="0"
                                step="1"
                            />
                            {errors.minPurchase && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-xs sm:text-sm">{errors.minPurchase}</span>
                                </label>
                            )}
                        </div>

                        {/* Usage Limit */}
                        <div className="form-control">
                            <label className="label pb-2">
                                <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                    {t('admin.usageLimit') || 'Usage Limit'} <span className="text-error">*</span>
                                </span>
                            </label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleChange}
                                placeholder="100"
                                className={`input input-bordered border-2 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 ${errors.usageLimit ? 'input-error' : ''}`}
                                style={{
                                    borderColor: errors.usageLimit ? '#ef4444' : '#cbd5e1',
                                    color: '#1E293B',
                                    backgroundColor: '#ffffff'
                                }}
                                min="1"
                                step="1"
                            />
                            {errors.usageLimit && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-xs sm:text-sm">{errors.usageLimit}</span>
                                </label>
                            )}
                        </div>

                        {/* Expiry Date */}
                        <div className="form-control">
                            <label className="label pb-2">
                                <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                    {t('admin.expiryDate') || 'Expiry Date'} ({t('admin.optional') || 'Optional'})
                                </span>
                            </label>
                            <input
                                type="datetime-local"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className={`input input-bordered border-2 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 ${errors.expiryDate ? 'input-error' : ''}`}
                                style={{
                                    borderColor: errors.expiryDate ? '#ef4444' : '#cbd5e1',
                                    color: '#1E293B',
                                    backgroundColor: '#ffffff'
                                }}
                            />
                            {errors.expiryDate && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-xs sm:text-sm">{errors.expiryDate}</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Active Status - Full Width */}
                    <div className="form-control pt-2">
                        <label className="label cursor-pointer justify-start gap-3 py-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="toggle toggle-primary"
                                style={{ '--tglbg': '#cbd5e1', '--handleoffset': '1.55em' }}
                            />
                            <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                {t('admin.active') || 'Active'}
                            </span>
                        </label>
                    </div>

                    {/* Description - Full Width */}
                    <div className="form-control pt-2">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-sm sm:text-base" style={{ color: '#1E293B' }}>
                                {t('admin.description') || 'Description'} ({t('admin.optional') || 'Optional'})
                            </span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder={t('admin.couponDescriptionPlaceholder') || 'Enter coupon description...'}
                            className="textarea textarea-bordered border-2 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3"
                            style={{
                                borderColor: '#cbd5e1',
                                color: '#1E293B',
                                backgroundColor: '#ffffff',
                                minHeight: '100px'
                            }}
                            rows="4"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                        <button
                            type="submit"
                            className="btn btn-primary text-white flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-200 hover:shadow-md"
                            style={{ backgroundColor: '#1E293B' }}
                            disabled={isLoading}
                            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#0f172a'; }}
                            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#1E293B'; }}
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                initialData ? (t('common.update') || 'Update') : 'Create'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-200 hover:shadow-sm"
                            style={{
                                backgroundColor: '#ffffff',
                                borderColor: '#cbd5e1',
                                color: '#64748b',
                                borderWidth: '1px'
                            }}
                            disabled={isLoading}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#94a3b8';
                                    e.currentTarget.style.color = '#475569';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                    e.currentTarget.style.color = '#64748b';
                                }
                            }}
                        >
                            {t('common.cancel') || 'Cancel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CouponForm;

