import { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();

    // Get current language
    const currentLanguage = i18n.language || 'en';

    // Switch language function
    const switchLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    // Toggle between English and Bangla
    const toggleLanguage = () => {
        const newLang = currentLanguage === 'en' ? 'bn' : 'en';
        switchLanguage(newLang);
    };

    const value = {
        currentLanguage,
        switchLanguage,
        toggleLanguage,
        isEnglish: currentLanguage === 'en',
        isBangla: currentLanguage === 'bn',
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

