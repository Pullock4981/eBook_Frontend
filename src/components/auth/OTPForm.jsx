/**
 * OTP Form Component
 * 
 * Form for OTP verification.
 * Includes resend OTP functionality with countdown timer.
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

function OTPForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOTP, resendOTP, isLoading, error, clearAuthError } = useAuth();

    const mobile = location.state?.mobile || '';
    const isRegistration = location.state?.isRegistration || false;

    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();

    // Countdown timer for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => {
                setResendTimer(resendTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Auto-focus and format OTP input
    const handleOTPChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setValue('otp', value);
    };

    const onSubmit = async (data) => {
        clearAuthError();
        const result = await verifyOTP(mobile, data.otp);
        if (result.success) {
            // Check user role and redirect accordingly
            // useAuth returns: { success: true, data: response }
            // where response is: { success: true, data: { token, user } }
            const userData = result.data?.data?.user || result.data?.user || result.user;
            if (userData?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        clearAuthError();
        const result = await resendOTP(mobile);
        if (result.success) {
            setResendTimer(60);
            setCanResend(false);
        }
    };

    const handleChangeMobile = () => {
        navigate(isRegistration ? '/register' : '/login');
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Mobile Number Display */}
            <div className="text-center mb-4">
                <p className="text-sm" style={{ color: '#2d3748' }}>
                    {t('auth.otp.subtitle')}
                </p>
                <p className="text-lg font-semibold mt-2" style={{ color: '#1E293B' }}>
                    {mobile}
                </p>
            </div>

            {/* OTP Input */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium" style={{ color: '#1E293B' }}>
                        {t('auth.otp.otpLabel')}
                    </span>
                </label>
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder={t('auth.otp.otpPlaceholder')}
                    className={`input input-bordered w-full text-center text-2xl tracking-widest ${errors.otp ? 'input-error' : ''}`}
                    style={{
                        backgroundColor: '#ffffff',
                        borderColor: errors.otp ? '#ef4444' : '#e2e8f0',
                        color: '#1E293B',
                        letterSpacing: '0.5em',
                    }}
                    maxLength={6}
                    {...register('otp', {
                        required: t('auth.errors.otpRequired'),
                        pattern: {
                            value: /^\d{6}$/,
                            message: t('auth.errors.otpInvalid'),
                        },
                    })}
                    onChange={handleOTPChange}
                />
                {errors.otp && (
                    <label className="label">
                        <span className="label-text-alt text-error">{errors.otp.message}</span>
                    </label>
                )}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
                {!canResend ? (
                    <p className="text-sm" style={{ color: '#2d3748' }}>
                        {t('auth.otp.resendIn')} {resendTimer} {t('auth.otp.seconds')}
                    </p>
                ) : (
                    <button
                        type="button"
                        className="btn btn-link btn-sm"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        style={{ color: '#1E293B' }}
                    >
                        {t('auth.otp.resendOTP')}
                    </button>
                )}
            </div>

            {/* Change Mobile */}
            <div className="text-center">
                <button
                    type="button"
                    className="btn btn-link btn-sm"
                    onClick={handleChangeMobile}
                    style={{ color: '#64748b' }}
                >
                    {t('auth.otp.changeMobile')}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Submit Button */}
            <div className="form-control mt-6">
                <button
                    type="submit"
                    className="btn w-full text-white font-medium"
                    style={{ backgroundColor: '#1E293B' }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            {t('auth.loading.verifyingOTP')}
                        </>
                    ) : (
                        t('auth.otp.verifyButton')
                    )}
                </button>
            </div>
        </form>
    );
}

export default OTPForm;

