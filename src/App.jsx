import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { useSelector } from 'react-redux';
import { selectTheme } from './store/slices/themeSlice';
import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
// Import PDF.js config early to ensure worker is configured before any PDF operations
import './utils/pdfjsConfig';

function AppContent() {
    const theme = useSelector(selectTheme);

    // Sync theme with document on mount and theme change
    useEffect(() => {
        const html = document.documentElement;
        const savedTheme = localStorage.getItem('theme') || 'light';

        // Apply theme immediately on mount
        if (savedTheme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            html.classList.add('dark');
        } else {
            html.setAttribute('data-theme', 'light');
            html.classList.remove('dark');
        }
    }, []);

    // Update theme when Redux state changes
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

    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;

