/**
 * useThemeColors Hook
 * 
 * Provides theme-aware color values for buttons and text
 */

import { useSelector } from 'react-redux';
import { selectTheme } from '../store/slices/themeSlice';
import { getButtonColor, getButtonTextColor, getPrimaryTextColor, getSecondaryTextColor, getBackgroundColor, getErrorColor, getSuccessColor, getWarningColor, getInfoColor } from '../utils/themeColors';

export const useThemeColors = () => {
    const theme = useSelector(selectTheme);

    return {
        theme,
        isDark: theme === 'dark',
        buttonColor: getButtonColor(theme),
        buttonTextColor: getButtonTextColor(theme),
        primaryTextColor: getPrimaryTextColor(theme),
        secondaryTextColor: getSecondaryTextColor(theme),
        backgroundColor: getBackgroundColor(theme),
        errorColor: getErrorColor(),
        successColor: getSuccessColor(),
        warningColor: getWarningColor(),
        infoColor: getInfoColor(),
    };
};

