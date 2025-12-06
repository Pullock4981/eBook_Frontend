/**
 * Register Page
 * 
 * User registration page with mobile number.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RegisterForm from '../../components/auth/RegisterForm';
import Logo from '../../components/common/Logo';

function Register() {
    const { t } = useTranslation();

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
                                {t('auth.register.title')}
                            </h2>
                            <p className="text-sm mt-2" style={{ color: '#2d3748' }}>
                                {t('auth.register.subtitle')}
                            </p>
                        </div>

                        {/* Register Form */}
                        <RegisterForm />

                        {/* Login Link */}
                        <div className="text-center mt-6">
                            <p className="text-sm" style={{ color: '#2d3748' }}>
                                {t('auth.register.haveAccount')}{' '}
                                <Link
                                    to="/login"
                                    className="link link-hover font-semibold"
                                    style={{ color: '#1E293B' }}
                                >
                                    {t('auth.register.loginLink')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;

