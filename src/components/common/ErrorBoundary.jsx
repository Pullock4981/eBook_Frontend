/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Update state with error details
        this.setState({
            error: error,
            errorInfo: errorInfo,
        });

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return <ErrorFallback onReset={this.handleReset} />;
        }

        return this.props.children;
    }
}

// Error Fallback Component
function ErrorFallback({ onReset }) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
            <div className="text-center max-w-md">
                <div className="mb-6">
                    <svg
                        className="mx-auto h-24 w-24 text-error"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-base-content mb-4">
                    {t('common.error') || 'Oops! Something went wrong'}
                </h1>

                <p className="text-base-content/70 mb-6">
                    {t('common.errorMessage') || 'We encountered an unexpected error. Please try again.'}
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onReset}
                        className="btn btn-primary"
                    >
                        {t('common.tryAgain') || 'Try Again'}
                    </button>
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="btn btn-outline btn-primary"
                    >
                        {t('common.goHome') || 'Go Home'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorBoundary;

