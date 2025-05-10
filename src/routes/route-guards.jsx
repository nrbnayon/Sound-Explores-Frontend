// src\routes\route-guards.jsx
// "use client";;

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import LoadingScreen from "../components/loading-screen";

// Protected route component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public route component (redirects if already authenticated)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
