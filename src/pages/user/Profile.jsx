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
import { selectIsAuthenticated, updateUser } from '../../store/slices/authSlice';
import ProfileForm from '../../components/user/ProfileForm';
import PasswordForm from '../../components/user/PasswordForm';
import Loading from '../../components/common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';
// Toast notifications - using browser alert for now, can be replaced with toast library
const toast = {
    success: (message) => alert(message),
    error: (message) => alert(message)
};

function Profile() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor } = useThemeColors();
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
            const updatedProfile = await dispatch(updateUserProfile(profileData)).unwrap();
            // Update authSlice user data as well for consistency
            // Handle nested profile structure
            const userName = updatedProfile.profile?.name || updatedProfile.name || '';
            const userEmail = updatedProfile.profile?.email || updatedProfile.email || '';
            dispatch(updateUser({
                name: userName,
                email: userEmail
            }));
            // Refresh profile data from database to ensure UI shows latest data
            await dispatch(fetchUserProfile());
            toast.success(t('user.profileUpdated') || 'Profile updated successfully!');
            return updatedProfile;
        } catch (err) {
            toast.error(err || t('user.profileUpdateFailed') || 'Failed to update profile');
            throw err; // Re-throw to let form handle it
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
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                        {t('user.profile') || 'My Profile'}
                    </h1>
                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                        {t('user.profileDescription') || 'Manage your profile information and password'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-6 bg-base-100 p-1 rounded-lg border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    <button
                        className={`tab flex-1 text-sm sm:text-base font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all ${activeTab === 'profile' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                        style={{
                            backgroundColor: activeTab === 'profile' ? buttonColor : 'transparent',
                            color: activeTab === 'profile' ? '#ffffff' : secondaryTextColor
                        }}
                    >
                        {t('user.profileInfo') || 'Profile Information'}
                    </button>
                    <button
                        className={`tab flex-1 text-sm sm:text-base font-medium px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all ${activeTab === 'password' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('password')}
                        style={{
                            backgroundColor: activeTab === 'password' ? buttonColor : 'transparent',
                            color: activeTab === 'password' ? '#ffffff' : secondaryTextColor
                        }}
                    >
                        {t('user.changePassword') || 'Change Password'}
                    </button>
                </div>

                {/* Content */}
                <div className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 md:p-8 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                    {activeTab === 'profile' ? (
                        isLoading && !profile ? (
                            <div className="flex justify-center items-center py-12">
                                <Loading />
                            </div>
                        ) : (
                            <ProfileForm onSubmit={handleProfileUpdate} isLoading={isUpdating} />
                        )
                    ) : (
                        <PasswordForm onSubmit={handlePasswordChange} isLoading={isUpdating} />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;

