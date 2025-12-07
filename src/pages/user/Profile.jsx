/**
 * Profile Page
 * 
 * User profile management page
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateUserProfile, changeUserPassword, selectUserProfile, selectUserLoading, selectUserUpdating, selectUserError, clearError } from '../../store/slices/userSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import ProfileForm from '../../components/user/ProfileForm';
import PasswordForm from '../../components/user/PasswordForm';
import Loading from '../../components/common/Loading';
// Toast notifications - using browser alert for now, can be replaced with toast library
const toast = {
    success: (message) => alert(message),
    error: (message) => alert(message)
};

function Profile() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const profile = useSelector(selectUserProfile);
    const isLoading = useSelector(selectUserLoading);
    const isUpdating = useSelector(selectUserUpdating);
    const error = useSelector(selectUserError);

    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchUserProfile());
    }, [dispatch, isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleProfileUpdate = async (profileData) => {
        try {
            await dispatch(updateUserProfile(profileData)).unwrap();
            toast.success(t('user.profileUpdated') || 'Profile updated successfully!');
        } catch (err) {
            toast.error(err || t('user.profileUpdateFailed') || 'Failed to update profile');
        }
    };

    const handlePasswordChange = async (passwordData) => {
        try {
            await dispatch(changeUserPassword(passwordData)).unwrap();
            toast.success(t('user.passwordChanged') || 'Password changed successfully!');
        } catch (err) {
            toast.error(err || t('user.passwordChangeFailed') || 'Failed to change password');
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    if (isLoading && !profile) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                        {t('user.profile') || 'My Profile'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                        {t('user.profileDescription') || 'Manage your profile information and password'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-6 bg-white p-1" style={{ border: '1px solid #e2e8f0' }}>
                    <button
                        className={`tab tab-lg flex-1 ${activeTab === 'profile' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                        style={{
                            backgroundColor: activeTab === 'profile' ? '#1E293B' : 'transparent',
                            color: activeTab === 'profile' ? '#ffffff' : '#1E293B'
                        }}
                    >
                        {t('user.profileInfo') || 'Profile Information'}
                    </button>
                    <button
                        className={`tab tab-lg flex-1 ${activeTab === 'password' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('password')}
                        style={{
                            backgroundColor: activeTab === 'password' ? '#1E293B' : 'transparent',
                            color: activeTab === 'password' ? '#ffffff' : '#1E293B'
                        }}
                    >
                        {t('user.changePassword') || 'Change Password'}
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8" style={{ border: '1px solid #e2e8f0' }}>
                    {activeTab === 'profile' ? (
                        <ProfileForm onSubmit={handleProfileUpdate} isLoading={isUpdating} />
                    ) : (
                        <PasswordForm onSubmit={handlePasswordChange} isLoading={isUpdating} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;

