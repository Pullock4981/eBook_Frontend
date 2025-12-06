/**
 * Protected Route Component
 * 
 * Route guard that protects routes requiring authentication.
 * Redirects to login if user is not authenticated.
 */

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import Loading from './Loading';

/**
 * Protected Route Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 */
function ProtectedRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Show loading while checking authentication
    // In a real app, you might want to check token validity here
    if (isAuthenticated === undefined) {
        return <Loading message="Checking authentication..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render protected content
    return <>{children}</>;
}

export default ProtectedRoute;

