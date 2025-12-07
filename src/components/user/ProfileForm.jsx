/**
 * Profile Form Component
 * 
 * Form for viewing and updating user profile
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../../store/slices/userSlice';

function ProfileForm({ onSubmit, isLoading = false }) {
    const { t } = useTranslation();
    const profile = useSelector(selectUserProfile);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (profile) {
            // Handle nested profile structure (profile.profile.name) or flat structure (profile.name)
            const userName = profile.profile?.name || profile.name || '';
            const userEmail = profile.profile?.email || profile.email || '';
            setFormData({
                name: userName,
                email: userEmail
            });
        }
    }, [profile]);

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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data to original profile data
        if (profile) {
            const userName = profile.profile?.name || profile.name || '';
            const userEmail = profile.profile?.email || profile.email || '';
            setFormData({
                name: userName,
                email: userEmail
            });
        }
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                await onSubmit(formData);
                // Edit mode will be closed after successful update
                setIsEditing(false);
            } catch (error) {
                // Keep edit mode open if update fails
                console.error('Update failed:', error);
            }
        }
    };

    if (!profile) {
        return (
            <div className="text-center py-8">
                <p className="text-sm opacity-70" style={{ color: '#64748b' }}>
                    {t('common.loading') || 'Loading profile...'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Edit Button - View Mode */}
            {!isEditing && (
                <div className="flex justify-end pb-2">
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="btn btn-outline btn-sm sm:btn-md px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-all"
                        style={{
                            borderColor: '#1E293B',
                            color: '#1E293B',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('common.edit') || 'Edit'}
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* User Name */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: '#1E293B' }}>
                            User Name
                            <span className="text-error ml-1">*</span>
                        </span>
                    </label>
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 ${errors.name ? 'input-error border-error' : ''
                                    }`}
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#1E293B',
                                    borderColor: errors.name ? '#EF4444' : '#cbd5e1',
                                    paddingLeft: '16px',
                                    paddingRight: '16px'
                                }}
                                placeholder="Enter user name"
                            />
                            {errors.name && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-xs">{errors.name}</span>
                                </label>
                            )}
                        </>
                    ) : (
                        <div className="px-4 py-2.5 min-h-[44px] flex items-center text-sm rounded-lg border-2" style={{
                            backgroundColor: '#f8fafc',
                            color: '#1E293B',
                            borderColor: '#e2e8f0'
                        }}>
                            {profile.profile?.name || profile.name || '-'}
                        </div>
                    )}
                </div>

                {/* User Email */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: '#1E293B' }}>
                            User Email
                            <span className="label-text-alt text-xs opacity-70 ml-2" style={{ color: '#64748b' }}>
                                Optional
                            </span>
                        </span>
                    </label>
                    {isEditing ? (
                        <>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`input input-bordered w-full h-11 text-sm border-2 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 ${errors.email ? 'input-error border-error' : ''
                                    }`}
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#1E293B',
                                    borderColor: errors.email ? '#EF4444' : '#cbd5e1',
                                    paddingLeft: '16px',
                                    paddingRight: '16px'
                                }}
                                placeholder="Enter user email"
                            />
                            {errors.email && (
                                <label className="label pt-1">
                                    <span className="label-text-alt text-error text-xs">{errors.email}</span>
                                </label>
                            )}
                        </>
                    ) : (
                        <div className="px-4 py-2.5 min-h-[44px] flex items-center text-sm rounded-lg border-2" style={{
                            backgroundColor: '#f8fafc',
                            color: (profile.profile?.email || profile.email) ? '#1E293B' : '#94a3b8',
                            borderColor: '#e2e8f0'
                        }}>
                            {profile.profile?.email || profile.email || t('common.notProvided') || 'Not provided'}
                        </div>
                    )}
                </div>

                {/* Phone Number (Read-only) */}
                <div className="form-control w-full">
                    <label className="label pb-1.5">
                        <span className="label-text text-sm font-medium" style={{ color: '#1E293B' }}>
                            Phone Number
                        </span>
                    </label>
                    <div className="px-4 py-2.5 min-h-[44px] flex items-center text-sm rounded-lg border-2" style={{
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        borderColor: '#cbd5e1'
                    }}>
                        {profile.mobile || '-'}
                    </div>
                    <label className="label pt-1">
                        <span className="label-text-alt text-xs opacity-70" style={{ color: '#64748b' }}>
                            {t('user.mobileCannotChange') || 'Mobile number cannot be changed'}
                        </span>
                    </label>
                </div>

                {/* Action Buttons - Edit Mode */}
                {isEditing && (
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t" style={{ borderColor: '#e2e8f0' }}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-outline w-full sm:w-auto px-6 py-2.5 text-sm font-medium hover:bg-gray-50 transition-all order-2 sm:order-1"
                            style={{
                                borderColor: '#cbd5e1',
                                color: '#1E293B',
                                backgroundColor: '#ffffff'
                            }}
                            disabled={isLoading}
                        >
                            {t('common.cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary text-white w-full sm:w-auto px-6 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all order-1 sm:order-2"
                            style={{
                                backgroundColor: '#1E293B',
                                borderColor: '#1E293B'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    <span className="ml-2">{t('common.saving') || 'Saving...'}</span>
                                </>
                            ) : (
                                <span>{t('common.save') || 'Save'}</span>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default ProfileForm;

