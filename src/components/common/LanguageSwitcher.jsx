/**
 * Language Switcher Component
 * 
 * Dropdown component for switching between English and Bangla.
 * Uses i18next for language management and Redux for state.
 */

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const { currentLanguage, switchLanguage } = useLanguage();

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'bn', name: 'Bangla', nativeName: 'বাংলা' },
    ];

    const handleLanguageChange = (langCode) => {
        switchLanguage(langCode);
        i18n.changeLanguage(langCode);
    };

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                </svg>
            </label>
            <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-lg border border-base-300"
            >
                {languages.map((lang) => (
                    <li key={lang.code}>
                        <button
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center justify-between ${currentLanguage === lang.code ? 'active' : ''
                                }`}
                        >
                            <span>{lang.nativeName}</span>
                            {currentLanguage === lang.code && (
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LanguageSwitcher;

