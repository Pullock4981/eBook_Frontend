/**
 * Login Form Component
 * 
 * Form for user login with mobile number and optional password.
 * Uses React Hook Form for form management.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { validateMobile } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../../hooks/useThemeColors';

function LoginForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { requestOTP, loginWithPassword, isLoading, error, clearAuthError } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const {
        buttonColor,
        buttonTextColor,
        primaryTextColor,
        secondaryTextColor,
        inputBackgroundColor,
        borderColor,
        errorColor
    } = useThemeColors();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();

    const mobile = watch('mobile');
    const password = watch('password');

    const onSubmit = async (data) => {
        clearAuthError();

        // If password is provided, use password login
        // Otherwise, use OTP login
        if (data.password && data.password.trim() !== '') {
            // Login with password
            const result = await loginWithPassword(data.mobile, data.password);
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
        } else {
            // Request OTP
            const result = await requestOTP(data.mobile);
            // Debug log
            console.log('🔑 LoginForm - Full result:', result);
            console.log('🔑 LoginForm - Result.otp:', result.otp);
            console.log('🔑 LoginForm - Result.data:', result.data);
            console.log('🔑 LoginForm - Result.data?.data:', result.data?.data);

            if (result.success) {
                // Extract OTP from result (multiple possible paths)
                const otp = result.otp || result.data?.data?.otp || result.data?.otp || null;
                console.log('🔑 LoginForm - Final OTP to pass:', otp);

                navigate('/verify-otp', {
                    state: {
                        mobile: data.mobile,
                        otp: otp // Pass OTP to OTP page
                    }
                });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Mobile Number */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium" style={{ color: primaryTextColor }}>
                        {t('auth.login.mobileLabel')}
                    </span>
                </label>
                <input
                    type="tel"
                    placeholder={t('auth.login.mobilePlaceholder')}
                    className={`input input-bordered w-full ${errors.mobile ? 'input-error' : ''}`}
                    style={{
                        backgroundColor: inputBackgroundColor,
                        borderColor: errors.mobile ? errorColor : borderColor,
                        color: primaryTextColor,
                        padding: '12px 16px',
                    }}
                    {...register('mobile', {
                        required: t('auth.errors.mobileRequired'),
                        validate: (value) => {
                            if (!validateMobile(value)) {
                                return t('auth.errors.mobileInvalid');
                            }
                            return true;
                        },
                    })}
                />
                {errors.mobile && (
                    <label className="label">
                        <span className="label-text-alt text-error">{errors.mobile.message}</span>
                    </label>
                )}
            </div>

            {/* Password (Optional) */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium" style={{ color: primaryTextColor }}>
                        {t('auth.login.passwordLabel')} <span className="text-sm font-normal" style={{ color: secondaryTextColor }}>({t('auth.login.optional') || 'Optional'})</span>
                    </span>
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth.login.passwordPlaceholder') || 'Enter password (leave empty for OTP login)'}
                        className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                        style={{
                            backgroundColor: inputBackgroundColor,
                            borderColor: errors.password ? errorColor : borderColor,
                            color: primaryTextColor,
                            padding: '12px 16px',
                        }}
                        {...register('password', {
                            required: false,
                            minLength: password && password.trim() !== ''
                                ? {
                                    value: 6,
                                    message: t('auth.errors.passwordMinLength'),
                                }
                                : undefined,
                        })}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: secondaryTextColor }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: secondaryTextColor }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.password && (
                    <label className="label">
                        <span className="label-text-alt text-error">{errors.password.message}</span>
                    </label>
                )}
                <label className="label">
                    <span className="label-text-alt" style={{ color: secondaryTextColor }}>
                        {t('auth.login.passwordHint') || 'Leave empty to login with OTP'}
                    </span>
                </label>
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
                    className="btn w-full font-medium"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            {password && password.trim() !== ''
                                ? t('auth.loading.loggingIn')
                                : t('auth.loading.requestingOTP')}
                        </>
                    ) : password && password.trim() !== '' ? (
                        t('auth.login.loginButton') || 'Login'
                    ) : (
                        t('auth.login.requestOTP')
                    )}
                </button>
            </div>
        </form>
    );
}

export default LoginForm;

