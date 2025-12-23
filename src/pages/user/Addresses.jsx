/**
 * Addresses Page
 * 
 * User address management page
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAddresses, createAddress, updateAddress, deleteAddress, selectUserAddresses, selectUserLoading, selectUserUpdating, selectUserError, clearError } from '../../store/slices/userSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import AddressForm from '../../components/user/AddressForm';
import Loading from '../../components/common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';
import { showSuccess, showError } from '../../utils/toast';
import Swal from 'sweetalert2';
import * as userService from '../../services/userService';

function Addresses() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor } = useThemeColors();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const addresses = useSelector(selectUserAddresses);
    const isLoading = useSelector(selectUserLoading);
    const isUpdating = useSelector(selectUserUpdating);
    const error = useSelector(selectUserError);

    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        dispatch(fetchAddresses());
    }, [dispatch, isAuthenticated, navigate]);

    useEffect(() => {
        if (error) {
            showError(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleAddNew = () => {
        setEditingAddress(null);
        setShowForm(true);
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAddress(null);
    };

    const handleSubmit = async (addressData) => {
        try {
            if (editingAddress) {
                await dispatch(updateAddress({ addressId: editingAddress._id, addressData })).unwrap();
                showSuccess(t('user.addressUpdated') || 'Address updated successfully!');
            } else {
                await dispatch(createAddress(addressData)).unwrap();
                showSuccess(t('user.addressCreated') || 'Address created successfully!');
            }
            // Refresh addresses list
            await dispatch(fetchAddresses());
            setShowForm(false);
            setEditingAddress(null);
        } catch (err) {
            showError(err || t('user.addressOperationFailed') || 'Failed to save address');
        }
    };

    const handleDelete = async (addressId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: t('user.confirmDeleteAddress') || 'You want to delete this address?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('common.delete') || 'Delete',
            cancelButtonText: t('common.cancel') || 'Cancel',
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await dispatch(deleteAddress(addressId)).unwrap();
            showSuccess(t('user.addressDeleted') || 'Address deleted successfully!');
        } catch (err) {
            showError(err || t('user.addressDeleteFailed') || 'Failed to delete address');
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await userService.setDefaultAddress(addressId);
            showSuccess(t('user.defaultAddressSet') || 'Default address updated!');
            dispatch(fetchAddresses()); // Refresh addresses
        } catch (err) {
            showError(err.message || t('user.defaultAddressFailed') || 'Failed to set default address');
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div style={{ backgroundColor }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryTextColor }}>
                            {t('user.addresses') || 'My Addresses'}
                        </h1>
                        <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                            {t('user.addressesDescription') || 'Manage your shipping addresses'}
                        </p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={handleAddNew}
                            className="btn btn-primary text-white px-6 py-2.5"
                            style={{ backgroundColor: buttonColor }}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('user.addAddress') || 'Add Address'}
                        </button>
                    )}
                </div>

                {/* Address Form */}
                {showForm && (
                    <div className="mb-6 bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 md:p-8 border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: primaryTextColor }}>
                            {editingAddress ? (t('user.editAddress') || 'Edit Address') : (t('user.addNewAddress') || 'Add New Address')}
                        </h2>
                        <AddressForm
                            address={editingAddress}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isLoading={isUpdating}
                        />
                    </div>
                )}

                {/* Addresses List */}
                {isLoading ? (
                    <Loading />
                ) : addresses.length === 0 ? (
                    <div className="bg-base-100 rounded-lg shadow-sm p-8 sm:p-12 text-center border" style={{ borderColor: secondaryTextColor, backgroundColor }}>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: secondaryTextColor }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: primaryTextColor }}>
                            {t('user.noAddresses') || 'No Addresses Found'}
                        </h3>
                        <p className="text-sm sm:text-base opacity-70 mb-6" style={{ color: secondaryTextColor }}>
                            {t('user.noAddressesDescription') || 'Add your first address to get started'}
                        </p>
                        {!showForm && (
                            <button
                                onClick={handleAddNew}
                                className="btn btn-primary text-white px-6 py-2.5"
                                style={{ backgroundColor: buttonColor }}
                            >
                                {t('user.addAddress') || 'Add Address'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                className="bg-base-100 rounded-lg shadow-sm p-4 sm:p-6 border-2 relative"
                                style={{
                                    borderColor: address.isDefault ? buttonColor : secondaryTextColor,
                                    backgroundColor
                                }}
                            >
                                {/* Default Badge */}
                                {address.isDefault && (
                                    <div className="absolute top-4 right-4">
                                        <span className="badge badge-primary text-white text-xs" style={{ backgroundColor: buttonColor }}>
                                            {t('common.default') || 'Default'}
                                        </span>
                                    </div>
                                )}

                                {/* Label */}
                                <div className="mb-3">
                                    <span className="badge badge-outline text-sm" style={{ borderColor: buttonColor, color: buttonColor }}>
                                        {address.label || 'Home'}
                                    </span>
                                </div>

                                {/* Address Details */}
                                <div className="space-y-2 mb-4">
                                    <p className="font-semibold text-base sm:text-lg" style={{ color: primaryTextColor }}>
                                        {address.recipientName}
                                    </p>
                                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                                        {address.recipientMobile}
                                    </p>
                                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    <p className="text-sm sm:text-base opacity-70" style={{ color: secondaryTextColor }}>
                                        {address.area}, {address.city}, {address.district}
                                        {address.postalCode && ` - ${address.postalCode}`}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: secondaryTextColor }}>
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address._id)}
                                            className="btn btn-sm btn-outline flex-1 sm:flex-none px-4 py-2"
                                            style={{ borderColor: buttonColor, color: primaryTextColor, backgroundColor: backgroundColor }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = secondaryTextColor + '20';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = backgroundColor;
                                            }}
                                        >
                                            {t('user.setDefault') || 'Set Default'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="btn btn-sm text-white flex-1 sm:flex-none px-4 py-2"
                                        style={{ backgroundColor: buttonColor, borderColor: buttonColor }}
                                    >
                                        {t('common.edit') || 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address._id)}
                                        className="btn btn-sm text-white flex-1 sm:flex-none hover:opacity-90 transition-all px-4 py-2"
                                        style={{
                                            backgroundColor: errorColor || '#ef4444',
                                            borderColor: errorColor || '#ef4444'
                                        }}
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        {t('common.delete') || 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Addresses;

