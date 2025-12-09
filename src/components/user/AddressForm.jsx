/**
 * Address Form Component
 * 
 * Form for creating/editing user addresses
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../hooks/useThemeColors';

function AddressForm({ address = null, onSubmit, onCancel, isLoading = false }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();

    const [formData, setFormData] = useState({
        label: 'Home',
        recipientName: '',
        recipientMobile: '',
        addressLine1: '',
        addressLine2: '',
        area: '',
        city: '',
        district: '',
        postalCode: '',
        isDefault: false
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (address) {
            setFormData({
                label: address.label || 'Home',
                recipientName: address.recipientName || '',
                recipientMobile: address.recipientMobile || '',
                addressLine1: address.addressLine1 || '',
                addressLine2: address.addressLine2 || '',
                area: address.area || '',
                city: address.city || '',
                district: address.district || '',
                postalCode: address.postalCode || '',
                isDefault: address.isDefault || false
            });
        }
    }, [address]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.recipientName.trim()) {
            newErrors.recipientName = t('user.addressNameRequired') || 'Recipient name is required';
        }

        if (!formData.recipientMobile.trim()) {
            newErrors.recipientMobile = t('auth.mobileRequired') || 'Phone number is required';
        } else if (!/^01[3-9]\d{8}$/.test(formData.recipientMobile)) {
            newErrors.recipientMobile = t('auth.mobileInvalid') || 'Invalid phone number';
        }

        if (!formData.addressLine1.trim()) {
            newErrors.addressLine1 = t('user.addressLine1Required') || 'Address line 1 is required';
        }

        if (!formData.area.trim()) {
            newErrors.area = t('user.areaRequired') || 'Area is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = t('user.cityRequired') || 'City is required';
        }

        if (!formData.district.trim()) {
            newErrors.district = t('user.districtRequired') || 'District is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Address Label - Full Width */}
            <div className="form-control w-full">
                <label className="label pb-1.5">
                    <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                        {t('user.addressLabel') || 'Address Label'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <select
                    name="label"
                    value={formData.label}
                    onChange={handleChange}
                    className="select select-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                    style={{
                        backgroundColor: backgroundColor,
                        color: primaryTextColor,
                        borderColor: secondaryTextColor,
                        paddingLeft: '16px',
                        paddingRight: '16px'
                    }}
                >
                    <option value="Home">{t('user.labelHome') || 'Home'}</option>
                    <option value="Office">{t('user.labelOffice') || 'Office'}</option>
                    <option value="Other">{t('user.labelOther') || 'Other'}</option>
                </select>
            </div>

            {/* Recipient Name & Mobile - 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Recipient Name */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                            {t('user.recipientName') || 'Recipient Name'}
                            <span className="text-error ml-1">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary ${errors.recipientName ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: errors.recipientName ? '#EF4444' : secondaryTextColor,
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}
                        placeholder={t('user.enterRecipientName') || 'Enter recipient name'}
                    />
                    {errors.recipientName && (
                        <label className="label pt-1">
                            <span className="label-text-alt text-error text-xs">{errors.recipientName}</span>
                        </label>
                    )}
                </div>

                {/* Recipient Mobile */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                            {t('user.recipientMobile') || 'Recipient Mobile'}
                            <span className="text-error ml-1">*</span>
                        </span>
                    </label>
                    <input
                        type="tel"
                        name="recipientMobile"
                        value={formData.recipientMobile}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary ${errors.recipientMobile ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: errors.recipientMobile ? '#EF4444' : secondaryTextColor,
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}
                        placeholder="01XXXXXXXXX"
                    />
                    {errors.recipientMobile && (
                        <label className="label pt-1">
                            <span className="label-text-alt text-error text-xs">{errors.recipientMobile}</span>
                        </label>
                    )}
                </div>
            </div>

            {/* Address Line 1 - Full Width */}
            <div className="form-control w-full">
                <label className="label pb-1.5">
                    <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                        {t('user.addressLine1') || 'Address Line 1'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={`input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary ${errors.addressLine1 ? 'input-error border-error' : ''
                        }`}
                    style={{
                        backgroundColor: backgroundColor,
                        color: primaryTextColor,
                        borderColor: errors.addressLine1 ? '#EF4444' : secondaryTextColor,
                        paddingLeft: '16px',
                        paddingRight: '16px'
                    }}
                    placeholder={t('user.enterAddressLine1') || 'Street address, house number'}
                />
                {errors.addressLine1 && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-xs">{errors.addressLine1}</span>
                    </label>
                )}
            </div>

            {/* Address Line 2 - Full Width */}
            <div className="form-control w-full">
                <label className="label pb-1.5">
                    <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                        {t('user.addressLine2') || 'Address Line 2'}
                        <span className="label-text-alt text-xs opacity-70 ml-2" style={{ color: secondaryTextColor }}>
                            {t('common.optional') || 'Optional'}
                        </span>
                    </span>
                </label>
                <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                    style={{
                        backgroundColor: backgroundColor,
                        color: primaryTextColor,
                        borderColor: secondaryTextColor,
                        paddingLeft: '16px',
                        paddingRight: '16px'
                    }}
                    placeholder={t('user.enterAddressLine2') || 'Apartment, suite, unit, etc.'}
                />
            </div>

            {/* Area & Postal Code - 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Area */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                            {t('user.area') || 'Area'}
                            <span className="text-error ml-1">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary ${errors.area ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: errors.area ? '#EF4444' : secondaryTextColor,
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}
                        placeholder={t('user.enterArea') || 'Enter area'}
                    />
                    {errors.area && (
                        <label className="label pt-1">
                            <span className="label-text-alt text-error text-xs">{errors.area}</span>
                        </label>
                    )}
                </div>

                {/* Postal Code */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                            {t('user.postalCode') || 'Postal Code'}
                            <span className="label-text-alt text-xs opacity-70 ml-2" style={{ color: secondaryTextColor }}>
                                {t('common.optional') || 'Optional'}
                            </span>
                        </span>
                    </label>
                    <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: secondaryTextColor,
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}
                        placeholder={t('user.enterPostalCode') || 'Enter postal code'}
                    />
                </div>
            </div>

            {/* City & District - 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                            {t('user.city') || 'City'}
                            <span className="text-error ml-1">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary ${errors.city ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: errors.city ? '#EF4444' : secondaryTextColor,
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}
                        placeholder={t('user.enterCity') || 'Enter city'}
                    />
                    {errors.city && (
                        <label className="label pt-1">
                            <span className="label-text-alt text-error text-xs">{errors.city}</span>
                        </label>
                    )}
                </div>

                {/* District */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: primaryTextColor }}>
                            {t('user.district') || 'District'}
                            <span className="text-error ml-1">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-primary ${errors.district ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: errors.district ? '#EF4444' : secondaryTextColor,
                            paddingLeft: '16px',
                            paddingRight: '16px'
                        }}
                        placeholder={t('user.enterDistrict') || 'Enter district'}
                    />
                    {errors.district && (
                        <label className="label pt-1">
                            <span className="label-text-alt text-error text-xs">{errors.district}</span>
                        </label>
                    )}
                </div>
            </div>

            {/* Set as Default */}
            <div className="form-control pt-2">
                <label className="label cursor-pointer p-3 sm:p-4 rounded-lg border-2 transition-colors flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0" style={{ borderColor: secondaryTextColor, backgroundColor: backgroundColor }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = backgroundColor;
                    }}
                >
                    <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="label-text text-sm font-medium mb-1 break-words" style={{ color: primaryTextColor }}>
                            {t('user.setAsDefault') || 'Set as Default Address'}
                        </span>
                        <span className="label-text-alt text-xs opacity-70 break-words" style={{ color: secondaryTextColor }}>
                            {t('user.defaultAddressHint') || 'Use this address as default for future orders'}
                        </span>
                    </div>
                    <div className="flex-shrink-0 self-start sm:self-center">
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                            className="toggle toggle-primary toggle-sm sm:toggle-md"
                            style={{ backgroundColor: formData.isDefault ? buttonColor : secondaryTextColor }}
                        />
                    </div>
                </label>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t" style={{ borderColor: secondaryTextColor }}>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline w-full sm:w-auto order-2 sm:order-1 px-6 py-2.5 text-sm font-medium transition-all"
                        style={{
                            borderColor: secondaryTextColor,
                            color: primaryTextColor,
                            backgroundColor: backgroundColor
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = backgroundColor;
                        }}
                        disabled={isLoading}
                    >
                        {t('common.cancel') || 'Cancel'}
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary text-white w-full sm:w-auto order-1 sm:order-2 px-6 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                    style={{
                        backgroundColor: buttonColor,
                        borderColor: buttonColor
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            <span className="ml-2">{t('common.saving') || 'Saving...'}</span>
                        </>
                    ) : (
                        <span>{address ? (t('common.update') || 'Update') : (t('common.add') || 'Add')}</span>
                    )}
                </button>
            </div>
        </form>
    );
}

export default AddressForm;

