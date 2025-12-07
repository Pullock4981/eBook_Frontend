/**
 * Address Selector Component
 * 
 * Component for selecting shipping address during checkout
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { getAddresses } from '../../services/userService';

function AddressSelector({ selectedAddressId, onAddressChange, hasPhysicalProducts = true }) {
    const { t } = useTranslation();
    const location = useLocation();
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAddresses = async () => {
            if (!hasPhysicalProducts) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await getAddresses();
                // API interceptor returns response.data, so response is already { success, message, data }
                const addressList = (response && response.data) ? (Array.isArray(response.data) ? response.data : []) : [];
                setAddresses(addressList);

                // Auto-select default address if available and no address is selected
                if (addressList.length > 0 && !selectedAddressId) {
                    const defaultAddress = addressList.find(addr => addr.isDefault) || addressList[0];
                    if (defaultAddress && onAddressChange) {
                        onAddressChange(defaultAddress._id);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load addresses');
            } finally {
                setIsLoading(false);
            }
        };

        loadAddresses();
    }, [hasPhysicalProducts, onAddressChange, location.pathname]); // Refresh when route changes (e.g., coming back from address page)

    if (!hasPhysicalProducts) {
        return null; // No address needed for digital-only orders
    }

    if (isLoading) {
        return (
            <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                <div className="card-body p-4">
                    <div className="flex items-center justify-center py-8">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card bg-base-100 shadow-sm border-2 border-error" style={{ borderColor: '#EF4444' }}>
                <div className="card-body p-4">
                    <div className="alert alert-error">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (addresses.length === 0) {
        return (
            <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
                <div className="card-body p-4">
                    <div className="text-center py-4">
                        <p className="text-sm opacity-70 mb-4" style={{ color: '#2d3748' }}>
                            {t('checkout.noAddress') || 'No shipping address found. Please add an address to continue.'}
                        </p>
                        <Link
                            to="/dashboard/addresses"
                            className="btn btn-primary btn-sm text-white"
                            style={{ backgroundColor: '#1E293B' }}
                        >
                            {t('checkout.addAddress') || 'Add Address'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-sm border-2" style={{ borderColor: '#e2e8f0' }}>
            <div className="card-body p-4">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E293B' }}>
                    {t('checkout.shippingAddress') || 'Shipping Address'}
                </h3>
                <div className="space-y-3">
                    {addresses.map((address) => (
                        <label
                            key={address._id}
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAddressId === address._id
                                ? 'border-primary bg-primary/5'
                                : 'border-base-300 hover:border-primary/50'
                                }`}
                            style={{
                                borderColor: selectedAddressId === address._id ? '#1E293B' : '#cbd5e1',
                                backgroundColor: selectedAddressId === address._id ? '#f1f5f9' : 'transparent'
                            }}
                        >
                            <input
                                type="radio"
                                name="shippingAddress"
                                value={address._id}
                                checked={selectedAddressId === address._id}
                                onChange={() => onAddressChange && onAddressChange(address._id)}
                                className="radio radio-primary mt-1"
                                style={{ accentColor: '#1E293B' }}
                            />
                            <div className="flex-grow">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="badge badge-outline badge-sm" style={{ borderColor: '#1E293B', color: '#1E293B' }}>
                                                {address.label || 'Home'}
                                            </span>
                                            {address.isDefault && (
                                                <span className="badge badge-sm badge-primary text-white" style={{ backgroundColor: '#1E293B' }}>
                                                    {t('common.default') || 'Default'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-base mb-1" style={{ color: '#1E293B' }}>
                                            {address.recipientName}
                                        </p>
                                        <p className="text-sm opacity-70 mb-1" style={{ color: '#2d3748' }}>
                                            {t('common.phone') || 'Phone'}: {address.recipientMobile}
                                        </p>
                                        <p className="text-sm opacity-70 mb-1" style={{ color: '#2d3748' }}>
                                            {address.addressLine1}
                                            {address.addressLine2 && `, ${address.addressLine2}`}
                                        </p>
                                        <p className="text-sm opacity-70 mb-1" style={{ color: '#2d3748' }}>
                                            {address.area}, {address.city}, {address.district}
                                            {address.postalCode && ` - ${address.postalCode}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: '#e2e8f0' }}>
                    <Link
                        to="/dashboard/addresses"
                        className="btn btn-outline btn-sm w-full"
                        style={{ borderColor: '#1E293B', color: '#1E293B' }}
                    >
                        {t('checkout.manageAddresses') || 'Manage Addresses'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AddressSelector;

