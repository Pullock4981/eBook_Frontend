/**
 * Affiliate Registration Modal Component
 * 
 * Modal form for affiliate registration
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { registerAsAffiliate } from '../../services/affiliateService';
import { registerAffiliate, fetchAffiliateProfile } from '../../store/slices/affiliateSlice';
import Loading from '../common/Loading';
import { useThemeColors } from '../../hooks/useThemeColors';

function AffiliateRegistrationModal({ onClose, onSuccess }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { buttonColor, primaryTextColor, secondaryTextColor, backgroundColor, errorColor, infoColor } = useThemeColors();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
    const selectedPaymentMethod = watch('paymentMethod', 'bank');

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const affiliateData = {
                paymentMethod: data.paymentMethod,
            };

            if (data.paymentMethod === 'bank') {
                affiliateData.bankDetails = {
                    accountName: data.accountName,
                    accountNumber: data.accountNumber,
                    bankName: data.bankName,
                    branchName: data.branchName,
                    routingNumber: data.routingNumber || '',
                };
            } else if (data.paymentMethod === 'mobile_banking') {
                affiliateData.mobileBanking = {
                    provider: data.provider,
                    accountNumber: data.mobileAccountNumber,
                    accountName: data.mobileAccountName,
                };
            }

            // Use Redux thunk for registration
            const result = await dispatch(registerAffiliate(affiliateData));

            console.log('Registration result:', result);
            console.log('Registration result type:', result.type);
            console.log('Registration result payload:', result.payload);

            // Check if registration was successful
            if (registerAffiliate.fulfilled.match(result)) {
                // Get affiliate data from payload
                const affiliate = result.payload?.affiliate || result.payload || {};
                setSuccess(true);
                setSuccessData({ affiliate });
                setError(null);

                // Show success alert immediately
                const referralCode = affiliate.referralCode || 'N/A';
                const status = affiliate.status || 'pending';

                alert(`✅ Registration Successful!\n\nYour Referral Code: ${referralCode}\nStatus: ${status.toUpperCase()}\n\nYour registration is pending admin approval. You'll receive your referral link once approved.`);

                // Fetch updated affiliate profile to get full details and update Redux state
                setTimeout(() => {
                    dispatch(fetchAffiliateProfile()).then(() => {
                        console.log('Affiliate profile fetched after registration');
                    }).catch((err) => {
                        console.error('Error fetching affiliate profile:', err);
                    });
                }, 500);

                // Call onSuccess after a short delay to allow user to see the success message
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                // Registration failed
                const errorMsg = result.payload || result.error?.message || 'Registration failed';
                console.error('Registration failed - result:', result);
                throw new Error(errorMsg);
            }
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to register as affiliate';
            setError(errorMessage);
            // Show error alert
            alert(`❌ Registration Failed!\n\n${errorMessage}\n\nPlease try again or contact support.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold" style={{ color: primaryTextColor }}>
                        Become an Affiliate
                    </h3>
                    <button
                        onClick={() => {
                            reset();
                            setSuccess(false);
                            setSuccessData(null);
                            setError(null);
                            onClose();
                        }}
                        className="btn btn-sm btn-circle btn-ghost"
                        disabled={loading && !success}
                        aria-label="Close modal"
                        style={{ color: primaryTextColor }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {success && successData && (
                    <div className="alert alert-success mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm sm:text-base mb-1">Registration Successful!</h4>
                            <p className="text-xs sm:text-sm">
                                Your referral code: <span className="font-mono font-bold">{successData.affiliate.referralCode}</span>
                            </p>
                            <p className="text-xs sm:text-sm mt-1">
                                Status: <span className="badge badge-sm badge-warning">{successData.affiliate.status}</span>
                            </p>
                            <p className="text-xs sm:text-sm mt-2">
                                Your registration is pending admin approval. You'll receive your referral link once approved.
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm sm:text-base">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" style={{ display: success ? 'none' : 'block' }}>
                    {/* Payment Method Selection */}
                    <div>
                        <label className="label">
                            <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                Payment Method <span className="text-error">*</span>
                            </span>
                        </label>
                        <select
                            {...register('paymentMethod', { required: 'Payment method is required' })}
                            className="select select-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                            style={{ borderColor: errors.paymentMethod ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                        >
                            <option value="bank">Bank Transfer</option>
                            <option value="mobile_banking">Mobile Banking</option>
                        </select>
                        {errors.paymentMethod && (
                            <p className="text-xs text-error mt-1">{errors.paymentMethod.message}</p>
                        )}
                    </div>

                    {/* Bank Details */}
                    {selectedPaymentMethod === 'bank' && (
                        <>
                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        Account Name <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('accountName', { required: 'Account name is required' })}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: errors.accountName ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder="Enter account holder name"
                                />
                                {errors.accountName && (
                                    <p className="text-xs text-error mt-1">{errors.accountName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        Account Number <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('accountNumber', { required: 'Account number is required' })}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: errors.accountNumber ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder="Enter account number"
                                />
                                {errors.accountNumber && (
                                    <p className="text-xs text-error mt-1">{errors.accountNumber.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">
                                        <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                            Bank Name <span className="text-error">*</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('bankName', { required: 'Bank name is required' })}
                                        className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                        style={{ borderColor: errors.bankName ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                        placeholder="Enter bank name"
                                    />
                                    {errors.bankName && (
                                        <p className="text-xs text-error mt-1">{errors.bankName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="label">
                                        <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                            Branch Name <span className="text-error">*</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('branchName', { required: 'Branch name is required' })}
                                        className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                        style={{ borderColor: errors.branchName ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                        placeholder="Enter branch name"
                                    />
                                    {errors.branchName && (
                                        <p className="text-xs text-error mt-1">{errors.branchName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        Routing Number
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('routingNumber')}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder="Enter routing number (optional)"
                                />
                            </div>
                        </>
                    )}

                    {/* Mobile Banking Details */}
                    {selectedPaymentMethod === 'mobile_banking' && (
                        <>
                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        Provider <span className="text-error">*</span>
                                    </span>
                                </label>
                                <select
                                    {...register('provider', { required: 'Provider is required' })}
                                    className="select select-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: errors.provider ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                >
                                    <option value="">Select provider</option>
                                    <option value="bkash">bKash</option>
                                    <option value="nagad">Nagad</option>
                                    <option value="rocket">Rocket</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.provider && (
                                    <p className="text-xs text-error mt-1">{errors.provider.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        Account Number <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('mobileAccountNumber', { required: 'Account number is required' })}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: errors.mobileAccountNumber ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder="Enter mobile account number"
                                />
                                {errors.mobileAccountNumber && (
                                    <p className="text-xs text-error mt-1">{errors.mobileAccountNumber.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm sm:text-base font-medium" style={{ color: primaryTextColor }}>
                                        Account Name <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    {...register('mobileAccountName', { required: 'Account name is required' })}
                                    className="input input-bordered w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base"
                                    style={{ borderColor: errors.mobileAccountName ? errorColor : secondaryTextColor, color: primaryTextColor, backgroundColor, minHeight: '44px' }}
                                    placeholder="Enter account holder name"
                                />
                                {errors.mobileAccountName && (
                                    <p className="text-xs text-error mt-1">{errors.mobileAccountName.message}</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Info Message - Only show if not success */}
                    {!success && (
                        <div className="alert" style={{ backgroundColor: infoColor + '20', borderColor: infoColor }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: infoColor }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm" style={{ color: infoColor }}>
                                Your registration will be reviewed by admin. You'll receive your referral link after approval.
                            </span>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                        {!success && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: buttonColor, minHeight: '48px' }}
                                onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.backgroundColor = buttonColor;
                                    }
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        <span className="ml-2">Submitting...</span>
                                    </>
                                ) : (
                                    'Submit Registration'
                                )}
                            </button>
                        )}
                        {success ? (
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setSuccess(false);
                                    setSuccessData(null);
                                    setError(null);
                                    onClose();
                                }}
                                className="btn flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-200 hover:shadow-md"
                                style={{ backgroundColor: buttonColor, minHeight: '48px' }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = buttonColor.startsWith('#') ? `color-mix(in srgb, ${buttonColor} 80%, black)` : `darken(${buttonColor}, 10%)`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = buttonColor;
                                }}
                            >
                                Close
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setError(null);
                                    onClose();
                                }}
                                disabled={loading}
                                className="btn flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50"
                                style={{ backgroundColor, color: primaryTextColor, borderColor: secondaryTextColor, borderWidth: '1px', minHeight: '48px' }}
                                onMouseEnter={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.backgroundColor = secondaryTextColor + '20';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!e.target.disabled) {
                                        e.target.style.backgroundColor = backgroundColor;
                                    }
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={loading ? undefined : onClose}></div>
        </div>
    );
}

export default AffiliateRegistrationModal;

