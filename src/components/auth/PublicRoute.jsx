import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingScreen from "../ui/LoadingScreen";

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <LoadingScreen />;
  }
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/sound-library";
    return <Navigate to={from} replace />;
  }
  if (isAuthenticated) {
    return <Navigate to='/sound-library' replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
