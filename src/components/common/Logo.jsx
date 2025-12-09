/**
 * Logo Component
 * 
 * Reusable logo component for the application.
 * Can be used in navbar, footer, or anywhere else.
 */

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../hooks/useThemeColors';

function Logo({ className = '', showText = true, size = 'md' }) {
    const { t } = useTranslation();
    const { primaryTextColor } = useThemeColors();

    const sizeClasses = {
        sm: 'text-base',
        md: 'text-lg sm:text-xl',
        lg: 'text-2xl sm:text-3xl',
    };

    return (
        <Link
            to="/"
            className={`btn btn-ghost font-bold ${sizeClasses[size]} ${className}`}
            style={{ color: primaryTextColor }}
        >
            {showText && (t('app.name') || 'eBook Store')}
        </Link>
    );
}

export default Logo;

