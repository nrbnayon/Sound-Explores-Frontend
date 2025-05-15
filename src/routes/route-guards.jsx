// // src\routes\route-guards.jsx
// // "use client";;

// import { Navigate } from "react-router-dom";
// import { useAuth } from "../hooks/use-auth";
// import LoadingScreen from "../components/loading-screen";

// // Protected route component
// export const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return <LoadingScreen />;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// // Public route component (redirects if already authenticated)
// export const PublicRoute = ({ children }) => {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return <LoadingScreen />;
//   }

//   if (isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../config/constants";
import { motion } from "framer-motion";

export const VerificationRoute = () => {
  const location = useLocation();
  const hasEmail = location.state?.email;

  // If there's no email in the location state, redirect to signup
  if (!hasEmail) {
    return <Navigate to={ROUTES.SIGNUP} replace />;
  }

  // Otherwise, render the verification component
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="max-h-screen bg-background"
    >
      <main className="md:container mx-auto flex justify-center">
        <div className="w-full md:max-w-md">
          <Outlet />
        </div>
      </main>
    </motion.div>
  );
};
