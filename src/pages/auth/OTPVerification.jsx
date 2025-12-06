/**
 * OTP Verification Page
 * 
 * OTP verification page for login/registration.
 */

import { useTranslation } from 'react-i18next';
import { useLocation, Navigate } from 'react-router-dom';
import OTPForm from '../../components/auth/OTPForm';
import Logo from '../../components/common/Logo';

function OTPVerification() {
    const { t } = useTranslation();
    const location = useLocation();

    // Redirect if mobile number is not provided
    if (!location.state?.mobile) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#EFECE3' }}>
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="card bg-white shadow-xl">
                    <div className="card-body">
                        {/* Logo */}
                        <div className="text-center mb-6">
                            <Logo size="lg" className="justify-center mb-4" />
                            <h2 className="text-2xl font-bold" style={{ color: '#1E293B' }}>
                                {t('auth.otp.title')}
                            </h2>
                            <p className="text-sm mt-2" style={{ color: '#2d3748' }}>
                                {t('auth.otp.subtitle')}
                            </p>
                        </div>

                        {/* OTP Form */}
                        <OTPForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OTPVerification;

