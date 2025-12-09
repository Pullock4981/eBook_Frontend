/**
 * ThemedButton Component
 * 
 * A button component that automatically applies theme-aware colors
 */

import { useThemeColors } from '../../hooks/useThemeColors';

export const ThemedButton = ({ children, className = '', style = {}, ...props }) => {
    const { buttonColor, buttonTextColor } = useThemeColors();

    return (
        <button
            className={className}
            style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                ...style
            }}
            {...props}
        >
            {children}
        </button>
    );
};

export const ThemedLink = ({ children, className = '', style = {}, to, ...props }) => {
    const { buttonColor, buttonTextColor } = useThemeColors();
    const Link = require('react-router-dom').Link;

    return (
        <Link
            to={to}
            className={className}
            style={{
                backgroundColor: buttonColor,
                color: buttonTextColor,
                ...style
            }}
            {...props}
        >
            {children}
        </Link>
    );
};

