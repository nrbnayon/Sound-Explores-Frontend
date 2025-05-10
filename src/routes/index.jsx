import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";
import LoadingScreen from "../components/ui/LoadingScreen";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// Lazy loaded components
const SignIn = lazy(() => import("../pages/auth/SignIn"));
const SignUp = lazy(() => import("../pages/auth/SignUp"));
const SendOtp = lazy(() => import("../pages/auth/SendOtp"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const ForgetPassword = lazy(() => import("../pages/auth/ForgetPassword"));
const SoundLibrary = lazy(() =>
  import("../pages/app/SoundLibrary/SoundLibrary")
);
const FriendList = lazy(() => import("../pages/app/Friends"));
const Profile = lazy(() => import("../pages/app/Profile/Profile"));
const EditProfile = lazy(() => import("../pages/app/Profile/EditProfile"));
const PrivacyPolicy = lazy(() => import("../pages/app/Profile/PrivacyPolicy"));
const Payment = lazy(() => import("../pages/app/Profile/Payment"));
const ChatInterface = lazy(() => import("../pages/app/Chat/ChatInterface"));
const NotFound = lazy(() => import("../pages/errors/NotFound"));

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>
        <Routes location={location} key={location.pathname}>
          {/* Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/" element={<SignIn />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/send-code" element={<SendOtp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/sound-library" element={<SoundLibrary />} />
              <Route path="/all-friends" element={<FriendList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/chat-interface" element={<ChatInterface />} />
            </Route>
          </Route>

          {/* Public routes outside of auth layout */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AppRoutes;
