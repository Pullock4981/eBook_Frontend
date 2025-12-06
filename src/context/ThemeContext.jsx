import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectTheme, toggleTheme as toggleReduxTheme, setTheme as setReduxTheme } from '../store/slices/themeSlice';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const dispatch = useDispatch();
    const theme = useSelector(selectTheme);

    // Apply theme to document on mount and when theme changes
    useEffect(() => {
        const html = document.documentElement;

        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            html.classList.add('dark');
        } else {
            html.setAttribute('data-theme', 'light');
            html.classList.remove('dark');
        }
    }, [theme]);

    // Toggle theme function - syncs with Redux
    const toggleTheme = () => {
        dispatch(toggleReduxTheme());
    };

    // Set theme function - syncs with Redux
    const setTheme = (newTheme) => {
        dispatch(setReduxTheme(newTheme));
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

