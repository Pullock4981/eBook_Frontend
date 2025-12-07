/**
 * Address Form Component
 * 
 * Form for creating/editing user addresses
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function AddressForm({ address = null, onSubmit, onCancel, isLoading = false }) {
    const { t } = useTranslation();

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
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Label */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('user.addressLabel') || 'Address Label'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <select
                    name="label"
                    value={formData.label}
                    onChange={handleChange}
                    className="select select-bordered w-full h-12 text-base border-2"
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: '#cbd5e1'
                    }}
                >
                    <option value="Home">{t('user.labelHome') || 'Home'}</option>
                    <option value="Office">{t('user.labelOffice') || 'Office'}</option>
                    <option value="Other">{t('user.labelOther') || 'Other'}</option>
                </select>
            </div>

            {/* Recipient Name */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('user.recipientName') || 'Recipient Name'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleChange}
                    className={`input input-bordered w-full h-12 text-base border-2 px-4 ${errors.recipientName ? 'input-error border-error' : ''
                        }`}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: errors.recipientName ? '#EF4444' : '#cbd5e1'
                    }}
                    placeholder={t('user.enterRecipientName') || 'Enter recipient name'}
                />
                {errors.recipientName && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.recipientName}</span>
                    </label>
                )}
            </div>

            {/* Recipient Mobile */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('user.recipientMobile') || 'Recipient Mobile'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <input
                    type="tel"
                    name="recipientMobile"
                    value={formData.recipientMobile}
                    onChange={handleChange}
                    className={`input input-bordered w-full h-12 text-base border-2 px-4 ${errors.recipientMobile ? 'input-error border-error' : ''
                        }`}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: errors.recipientMobile ? '#EF4444' : '#cbd5e1'
                    }}
                    placeholder="01XXXXXXXXX"
                />
                {errors.recipientMobile && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.recipientMobile}</span>
                    </label>
                )}
            </div>

            {/* Address Line 1 */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('user.addressLine1') || 'Address Line 1'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={`input input-bordered w-full h-12 text-base border-2 px-4 ${errors.addressLine1 ? 'input-error border-error' : ''
                        }`}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: errors.addressLine1 ? '#EF4444' : '#cbd5e1'
                    }}
                    placeholder={t('user.enterAddressLine1') || 'Street address, house number'}
                />
                {errors.addressLine1 && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.addressLine1}</span>
                    </label>
                )}
            </div>

            {/* Address Line 2 */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('user.addressLine2') || 'Address Line 2'}
                        <span className="label-text-alt text-xs opacity-70 ml-2" style={{ color: '#2d3748' }}>
                            {t('common.optional') || 'Optional'}
                        </span>
                    </span>
                </label>
                <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="input input-bordered w-full h-12 text-base border-2 px-4"
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: '#cbd5e1'
                    }}
                    placeholder={t('user.enterAddressLine2') || 'Apartment, suite, unit, etc.'}
                />
            </div>

            {/* Area */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('user.area') || 'Area'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className={`input input-bordered w-full h-12 text-base border-2 px-4 ${errors.area ? 'input-error border-error' : ''
                        }`}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: errors.area ? '#EF4444' : '#cbd5e1'
                    }}
                    placeholder={t('user.enterArea') || 'Enter area'}
                />
                {errors.area && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.area}</span>
                    </label>
                )}
            </div>

            {/* City & District */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <div className="form-control w-full">
                    <label className="label pb-2">
                        <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                            {t('user.city') || 'City'}
                            <span className="text-error ml-1">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-12 text-base border-2 px-4 ${errors.city ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: '#ffffff',
                            color: '#1E293B',
                            borderColor: errors.city ? '#EF4444' : '#cbd5e1'
                        }}
                        placeholder={t('user.enterCity') || 'Enter city'}
                    />
                    {errors.city && (
                        <label className="label pt-1">
                            <span className="label-text-alt text-error text-sm">{errors.city}</span>
                        </label>
                    )}
                </div>

                {/* District */}
                <div className="form-control w-full">
                    <label className="label pb-2">
                        <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                            {t('user.district') || 'District'}
                            <span className="text-error ml-1">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-12 text-base border-2 px-4 ${errors.district ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: '#ffffff',
                            color: '#1E293B',
                            borderColor: errors.district ? '#EF4444' : '#cbd5e1'
                        }}
                        placeholder={t('user.enterDistrict') || 'Enter district'}
                    />
                    {errors.district && (
                        <label className="label pt-1">
                            <span className="label-text-alt text-error text-sm">{errors.district}</span>
                        </label>
                    )}
                </div>
            </div>

            {/* Postal Code */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('user.postalCode') || 'Postal Code'}
                        <span className="label-text-alt text-xs opacity-70 ml-2" style={{ color: '#2d3748' }}>
                            {t('common.optional') || 'Optional'}
                        </span>
                    </span>
                </label>
                <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="input input-bordered w-full h-12 text-base border-2 px-4"
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: '#cbd5e1'
                    }}
                    placeholder={t('user.enterPostalCode') || 'Enter postal code'}
                />
            </div>

            {/* Set as Default */}
            <div className="form-control">
                <label className="label cursor-pointer p-4 rounded-lg border-2 hover:bg-base-200 transition-colors justify-between" style={{ borderColor: '#e2e8f0' }}>
                    <div className="flex flex-col">
                        <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                            {t('user.setAsDefault') || 'Set as Default Address'}
                        </span>
                        <span className="label-text-alt text-xs opacity-70" style={{ color: '#2d3748' }}>
                            {t('user.defaultAddressHint') || 'Use this address as default for future orders'}
                        </span>
                    </div>
                    <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleChange}
                        className="toggle toggle-primary"
                    />
                </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline"
                        style={{ borderColor: '#1E293B', color: '#1E293B' }}
                        disabled={isLoading}
                    >
                        {t('common.cancel') || 'Cancel'}
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary text-white"
                    style={{ backgroundColor: '#1E293B' }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            <span>{t('common.saving') || 'Saving...'}</span>
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

