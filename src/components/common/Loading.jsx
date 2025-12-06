/**
 * Loading Component
 * 
 * Displays a loading spinner with optional message.
 * Used throughout the application for loading states.
 */

import { useTranslation } from 'react-i18next';

/**
 * Loading Spinner Component
 * @param {Object} props
 * @param {string} props.message - Optional loading message
 * @param {string} props.size - Size of spinner (sm, md, lg)
 * @param {boolean} props.fullScreen - Whether to show full screen loading
 */
function Loading({ message, size = 'md', fullScreen = false }) {
    const { t } = useTranslation();

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Spinner */}
            <div className="loading loading-spinner" style={{
                width: size === 'sm' ? '24px' : size === 'md' ? '48px' : '64px',
                height: size === 'sm' ? '24px' : size === 'md' ? '48px' : '64px',
                borderColor: '#1E293B',
                borderTopColor: 'transparent',
            }}></div>

            {/* Message */}
            {message && (
                <p className="text-base-content/70 text-center">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-8">
            {content}
        </div>
    );
}

/**
 * Page Loading Component
 * Full screen loading for page transitions
 */
export function PageLoading({ message }) {
    return <Loading message={message || 'Loading...'} size="lg" fullScreen />;
}

/**
 * Button Loading Component
 * Small loading spinner for buttons
 */
export function ButtonLoading() {
    return (
        <span className="loading loading-spinner loading-sm"></span>
    );
}

export default Loading;

