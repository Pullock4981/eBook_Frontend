/**
 * Password Form Component
 * 
 * Form for changing user password
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../hooks/useThemeColors';

function PasswordForm({ onSubmit, isLoading = false }) {
    const { t } = useTranslation();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

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

        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = t('auth.passwordRequired') || 'Current password is required';
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = t('auth.passwordRequired') || 'New password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = t('auth.passwordMinLength') || 'Password must be at least 6 characters long';
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = t('auth.passwordRequired') || 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = t('auth.passwordMismatch') || 'Passwords do not match';
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = t('user.passwordSame') || 'New password must be different from current password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            // Reset form after successful submission
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                        {t('user.currentPassword') || 'Current Password'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <div className="relative">
                    <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-12 text-base border-2 px-4 pr-12 ${errors.currentPassword ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: errors.currentPassword ? '#EF4444' : secondaryTextColor
                        }}
                        placeholder={t('user.enterCurrentPassword') || 'Enter current password'}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                        style={{ color: secondaryTextColor }}
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                        {showPasswords.current ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 3m3.29 3.29L12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.currentPassword && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.currentPassword}</span>
                    </label>
                )}
            </div>

            {/* New Password */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                        {t('user.newPassword') || 'New Password'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <div className="relative">
                    <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-12 text-base border-2 px-4 pr-12 ${errors.newPassword ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: errors.newPassword ? '#EF4444' : secondaryTextColor
                        }}
                        placeholder={t('user.enterNewPassword') || 'Enter new password (min 6 characters)'}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                        style={{ color: secondaryTextColor }}
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                        {showPasswords.new ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 3m3.29 3.29L12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.newPassword && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.newPassword}</span>
                    </label>
                )}
            </div>

            {/* Confirm Password */}
            <div className="form-control w-full">
                <label className="label pb-2">
                    <span className="label-text text-sm sm:text-base font-semibold" style={{ color: primaryTextColor }}>
                        {t('auth.confirmPassword') || 'Confirm Password'}
                        <span className="text-error ml-1">*</span>
                    </span>
                </label>
                <div className="relative">
                    <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`input input-bordered w-full h-12 text-base border-2 px-4 pr-12 ${errors.confirmPassword ? 'input-error border-error' : ''
                            }`}
                        style={{
                            backgroundColor: backgroundColor,
                            color: primaryTextColor,
                            borderColor: errors.confirmPassword ? '#EF4444' : secondaryTextColor
                        }}
                        placeholder={t('auth.confirmPassword') || 'Confirm new password'}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                        style={{ color: secondaryTextColor }}
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                        {showPasswords.confirm ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 3m3.29 3.29L12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <label className="label pt-1">
                        <span className="label-text-alt text-error text-sm">{errors.confirmPassword}</span>
                    </label>
                )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="submit"
                    className="btn btn-primary text-white"
                    style={{ backgroundColor: buttonColor }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            <span>{t('common.saving') || 'Saving...'}</span>
                        </>
                    ) : (
                        <span>{t('user.changePassword') || 'Change Password'}</span>
                    )}
                </button>
            </div>
        </form>
    );
}

export default PasswordForm;

