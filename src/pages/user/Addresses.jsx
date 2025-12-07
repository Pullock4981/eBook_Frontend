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
// Toast notifications - using browser alert for now, can be replaced with toast library
const toast = {
    success: (message) => alert(message),
    error: (message) => alert(message)
};
import * as userService from '../../services/userService';

function Addresses() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
            toast.error(error);
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
                toast.success(t('user.addressUpdated') || 'Address updated successfully!');
            } else {
                await dispatch(createAddress(addressData)).unwrap();
                toast.success(t('user.addressCreated') || 'Address created successfully!');
            }
            // Refresh addresses list
            await dispatch(fetchAddresses());
            setShowForm(false);
            setEditingAddress(null);
        } catch (err) {
            toast.error(err || t('user.addressOperationFailed') || 'Failed to save address');
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm(t('user.confirmDeleteAddress') || 'Are you sure you want to delete this address?')) {
            return;
        }

        try {
            await dispatch(deleteAddress(addressId)).unwrap();
            toast.success(t('user.addressDeleted') || 'Address deleted successfully!');
        } catch (err) {
            toast.error(err || t('user.addressDeleteFailed') || 'Failed to delete address');
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await userService.setDefaultAddress(addressId);
            toast.success(t('user.defaultAddressSet') || 'Default address updated!');
            dispatch(fetchAddresses()); // Refresh addresses
        } catch (err) {
            toast.error(err.message || t('user.defaultAddressFailed') || 'Failed to set default address');
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#EFECE3' }}>
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1E293B' }}>
                            {t('user.addresses') || 'My Addresses'}
                        </h1>
                        <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                            {t('user.addressesDescription') || 'Manage your shipping addresses'}
                        </p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={handleAddNew}
                            className="btn btn-primary text-white px-6 py-2.5"
                            style={{ backgroundColor: '#1E293B' }}
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
                    <div className="mb-6 bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8" style={{ border: '1px solid #e2e8f0' }}>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#1E293B' }}>
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
                    <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center" style={{ border: '1px solid #e2e8f0' }}>
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#64748b' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{ color: '#1E293B' }}>
                            {t('user.noAddresses') || 'No Addresses Found'}
                        </h3>
                        <p className="text-sm sm:text-base opacity-70 mb-6" style={{ color: '#2d3748' }}>
                            {t('user.noAddressesDescription') || 'Add your first address to get started'}
                        </p>
                        {!showForm && (
                            <button
                                onClick={handleAddNew}
                                className="btn btn-primary text-white px-6 py-2.5"
                                style={{ backgroundColor: '#1E293B' }}
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
                                className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-2 relative"
                                style={{
                                    borderColor: address.isDefault ? '#1E293B' : '#e2e8f0'
                                }}
                            >
                                {/* Default Badge */}
                                {address.isDefault && (
                                    <div className="absolute top-4 right-4">
                                        <span className="badge badge-primary text-white text-xs" style={{ backgroundColor: '#1E293B' }}>
                                            {t('common.default') || 'Default'}
                                        </span>
                                    </div>
                                )}

                                {/* Label */}
                                <div className="mb-3">
                                    <span className="badge badge-outline text-sm" style={{ borderColor: '#1E293B', color: '#1E293B' }}>
                                        {address.label || 'Home'}
                                    </span>
                                </div>

                                {/* Address Details */}
                                <div className="space-y-2 mb-4">
                                    <p className="font-semibold text-base sm:text-lg" style={{ color: '#1E293B' }}>
                                        {address.recipientName}
                                    </p>
                                    <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                                        {address.recipientMobile}
                                    </p>
                                    <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                                        {address.addressLine1}
                                        {address.addressLine2 && `, ${address.addressLine2}`}
                                    </p>
                                    <p className="text-sm sm:text-base opacity-70" style={{ color: '#2d3748' }}>
                                        {address.area}, {address.city}, {address.district}
                                        {address.postalCode && ` - ${address.postalCode}`}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-4 border-t" style={{ borderColor: '#e2e8f0' }}>
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(address._id)}
                                            className="btn btn-sm btn-outline flex-1 sm:flex-none px-4 py-2"
                                            style={{ borderColor: '#1E293B', color: '#1E293B' }}
                                        >
                                            {t('user.setDefault') || 'Set Default'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="btn btn-sm text-white flex-1 sm:flex-none px-4 py-2"
                                        style={{ backgroundColor: '#1E293B', borderColor: '#1E293B' }}
                                    >
                                        {t('common.edit') || 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(address._id)}
                                        className="btn btn-sm text-white flex-1 sm:flex-none hover:opacity-90 transition-all px-4 py-2"
                                        style={{
                                            backgroundColor: '#ef4444',
                                            borderColor: '#ef4444'
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

