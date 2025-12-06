import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Get initial theme from localStorage or default to 'light'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    // Update theme in localStorage and apply to document
    useEffect(() => {
        localStorage.setItem('theme', theme);
        const html = document.documentElement;

        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            html.classList.add('dark');
        } else {
            html.setAttribute('data-theme', 'light');
            html.classList.remove('dark');
        }
    }, [theme]);

    // Toggle theme function
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

