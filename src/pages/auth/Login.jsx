/**
 * Login Page
 * 
 * User login page with mobile number and optional password.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginForm from '../../components/auth/LoginForm';
import Logo from '../../components/common/Logo';

function Login() {
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
                                {t('auth.login.title')}
                            </h2>
                            <p className="text-sm mt-2" style={{ color: '#2d3748' }}>
                                {t('auth.login.subtitle')}
                            </p>
                        </div>

                        {/* Login Form */}
                        <LoginForm />

                        {/* Register Link */}
                        <div className="text-center mt-6">
                            <p className="text-sm" style={{ color: '#2d3748' }}>
                                {t('auth.login.dontHaveAccount')}{' '}
                                <Link
                                    to="/register"
                                    className="link link-hover font-semibold"
                                    style={{ color: '#1E293B' }}
                                >
                                    {t('auth.login.registerLink')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

