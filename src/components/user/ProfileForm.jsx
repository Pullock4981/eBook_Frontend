/**
 * Profile Form Component
 * 
 * Form for updating user profile
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

function ProfileForm({ onSubmit, isLoading = false }) {
    const { t } = useTranslation();
    const user = useSelector(selectUser);

    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user?.profile) {
            setFormData({
                name: user.profile.name || '',
                email: user.profile.email || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

        if (!formData.name.trim()) {
            newErrors.name = t('auth.nameRequired') || 'Name is required';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('auth.emailInvalid') || 'Invalid email address';
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
            {/* Name */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('auth.name') || 'Name'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input input-bordered w-full h-12 text-base border-2 px-4 ${errors.name ? 'input-error border-error' : ''
                        }`}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: errors.name ? '#EF4444' : '#cbd5e1'
                    }}
                    placeholder={t('auth.name') || 'Enter your name'}
                />
                {errors.name && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.name}</span>
                    </label>
                )}
            </div>

            {/* Email */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('auth.email') || 'Email'}
                        <span className="label-text-alt text-xs opacity-70 ml-2" style={{ color: '#2d3748' }}>
                            {t('common.optional') || 'Optional'}
                        </span>
                    </span>
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input input-bordered w-full h-12 text-base border-2 px-4 ${errors.email ? 'input-error border-error' : ''
                        }`}
                    style={{
                        backgroundColor: '#ffffff',
                        color: '#1E293B',
                        borderColor: errors.email ? '#EF4444' : '#cbd5e1'
                    }}
                    placeholder={t('auth.email') || 'Enter your email'}
                />
                {errors.email && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.email}</span>
                    </label>
                )}
            </div>

            {/* Mobile (Read-only) */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: '#1E293B' }}>
                        {t('auth.mobile') || 'Mobile Number'}
                    </span>
                </label>
                <input
                    type="text"
                    value={user?.mobile || ''}
                    className="input input-bordered w-full h-12 text-base border-2 px-4"
                    style={{
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        borderColor: '#cbd5e1'
                    }}
                    disabled
                />
                <label className="label pt-1">
                    <span className="label-text-alt text-xs opacity-70" style={{ color: '#2d3748' }}>
                        {t('user.mobileCannotChange') || 'Mobile number cannot be changed'}
                    </span>
                </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
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
                        <span>{t('common.save') || 'Save'}</span>
                    )}
                </button>
            </div>
        </form>
    );
}

export default ProfileForm;

