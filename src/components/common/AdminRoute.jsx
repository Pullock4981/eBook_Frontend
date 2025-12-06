/**
 * Admin Route Component
 * 
 * Route guard that protects admin-only routes.
 * Requires both authentication and admin role.
 */

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { USER_ROLES } from '../../utils/constants';
import Loading from './Loading';

/**
 * Admin Route Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 */
function AdminRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    // Show loading while checking authentication
    if (isAuthenticated === undefined) {
        return <Loading message="Checking permissions..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin
    const isAdmin = user?.role === USER_ROLES.ADMIN;

    // Redirect to home if not admin
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Render admin content
    return <>{children}</>;
}

export default AdminRoute;

