import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../ui/LoadingScreen';

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  // If the user is authenticated and tries to access a public route like signin
  // redirect them to the app's main page
  if (isAuthenticated) {
    // Check if they were redirected to login from a specific page
    const from = location.state?.from?.pathname || '/sound-library';
    return <Navigate to={from} replace />;
  }

  // Otherwise, render the public route component
  return <Outlet />;
};

export default PublicRoute;