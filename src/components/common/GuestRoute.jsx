/**
 * Guest Route Component
 * 
 * Route guard that redirects authenticated users away from guest-only pages (login, register).
 * Redirects to dashboard if user is already authenticated.
 */

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

/**
 * Guest Route Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 */
function GuestRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Render guest-only content
    return <>{children}</>;
}

export default GuestRoute;

