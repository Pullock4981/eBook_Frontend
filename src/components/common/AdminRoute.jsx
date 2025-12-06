/**
 * Admin Route Component
 * 
 * Route guard that protects admin-only routes.
 * Requires both authentication and admin role.
 * Auto-refreshes user data to detect role changes.
 */

import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectIsAuthenticated, selectUser, updateUser } from '../../store/slices/authSlice';
import { getCurrentUser } from '../../services/userService';
import Loading from './Loading';

/**
 * Admin Route Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 */
function AdminRoute({ children }) {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);
    const [isChecking, setIsChecking] = useState(true);

    // Refresh user data to detect role changes (e.g., manually made admin)
    useEffect(() => {
        if (!isAuthenticated) {
            setIsChecking(false);
            return;
        }

        const checkUserRole = async () => {
            try {
                const response = await getCurrentUser();
                if (response?.success && response?.data) {
                    const updatedUser = response.data;
                    // Update Redux store with latest user data
                    dispatch(updateUser(updatedUser));
                    setIsChecking(false);
                } else {
                    setIsChecking(false);
                }
            } catch (error) {
                // If error, proceed with current user data
                setIsChecking(false);
            }
        };

        // Check immediately
        checkUserRole();
    }, [isAuthenticated, dispatch]);

    // Show loading while checking
    if (isChecking || isAuthenticated === undefined) {
        return <Loading message="Checking permissions..." />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin (after refresh)
    const isAdmin = user?.role === 'admin';

    // Redirect to home if not admin
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Render admin content
    return <>{children}</>;
}

export default AdminRoute;

