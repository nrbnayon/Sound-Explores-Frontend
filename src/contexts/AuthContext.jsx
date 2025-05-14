// src/contexts/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  setCookie,
  getCookie,
  removeCookie,
  hasCookie,
  setAuthTokens,
  removeAuthTokens,
} from "../utils/cookie-utils";
import apiClient from "../lib/api-client";
import { ROUTES } from "../config/constants";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if user is authenticated on component mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Checking authentication status");

      // Check for the authentication cookie
      if (
        hasCookie("isAuthenticated") &&
        (hasCookie("accessToken") || hasCookie("refreshToken"))
      ) {
        console.log("Auth cookie found, fetching user profile");
        try {
          // Get user profile from API
          const response = await apiClient.get("/user/me");
          console.log("User profile data:", response.data);
          setUser(response.data.data);
        } catch (error) {
          console.error("Error fetching user profile:", error);

          // Only remove tokens if the error is authentication related
          if (error.response && error.response.status === 401) {
            removeAuthTokens();
            setUser(null);
          }
        }
      } else {
        console.log("No auth cookie found, setting user to null");
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Sign in function
  const signIn = async (credentials) => {
    try {
      setLoading(true);
      console.log("Signing in with:", credentials.email);

      const response = await apiClient.post("/auth/login", credentials);
      console.log("Sign in response:", response.data);

      // Set auth tokens in cookies
      const { accessToken, refreshToken } = response.data.data;
      setAuthTokens(accessToken, refreshToken);

      // Store user data in state
      setUser(response.data.data.userData);

      toast.success("Successfully signed in!");
      navigate(ROUTES.SOUND_LIBRARY);
      return true;
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(error.response?.data?.message || "Failed to sign in");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (userData) => {
    try {
      setLoading(true);
      console.log("Creating new user account:", userData.email);

      const response = await apiClient.post("/user/create-user", userData);
      console.log("Sign up response:", response.data);

      // User may need to verify email before logging in
      if (response.data.success) {
        toast.success(
          "Account created successfully! Please verify your email."
        );
        navigate(ROUTES.SEND_CODE, { state: { email: userData.email } });
      }

      return true;
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error(error.response?.data?.message || "Failed to create account");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log("Signing out user");
      // Call logout API endpoint if available
      // await apiClient.post('/auth/logout');

      // Remove authentication cookies
      removeAuthTokens();

      // Clear user data
      setUser(null);

      // Clear all queries from the cache
      queryClient.clear();

      toast.success("Successfully signed out");
      navigate(ROUTES.SIGNIN);
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  // Request password reset
  const sendPasswordResetEmail = async (email) => {
    try {
      setLoading(true);
      console.log("Requesting password reset for:", email);

      await apiClient.patch("/auth/forgot-password-request", { email });

      toast.success(
        `If an account exists with ${email}, we've sent a reset link`
      );
      return true;
    } catch (error) {
      console.error("Send reset email error:", error);
      // We don't want to reveal if an email exists or not for security reasons
      toast.success(
        `If an account exists with ${email}, we've sent a reset link`
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP code
  const verifyOtp = async (email, otp) => {
    try {
      setLoading(true);
      console.log("Verifying OTP for:", email);

      const response = await apiClient.patch("/auth/verify-user", {
        email,
        otp,
      });
      console.log("OTP verification response:", response.data);

      toast.success("OTP verified successfully");
      return true;
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "Invalid OTP code");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const resendOtp = async (email) => {
    try {
      setLoading(true);
      console.log("Resending OTP for:", email);

      const response = await apiClient.post("/auth/resend-code", { email });
      console.log("Resend OTP response:", response.data);

      toast.success("Verification code has been resent");
      return true;
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error.response?.data?.message || "Failed to resend code");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (passwords) => {
    try {
      setLoading(true);
      console.log("Resetting password");

      const response = await apiClient.patch("/auth/reset-password", passwords);
      console.log("Reset password response:", response.data);

      toast.success("Password reset successfully");
      navigate(ROUTES.SIGNIN);
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwords) => {
    try {
      setLoading(true);
      console.log("Changing password");

      const response = await apiClient.patch(
        "/auth/update-password",
        passwords
      );
      console.log("Change password response:", response.data);

      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      console.log("Updating user profile:", profileData);

      const response = await apiClient.patch(
        "/user/update-profile",
        profileData
      );
      console.log("Update profile response:", response.data);

      // Update user data in state
      setUser(response.data.user);

      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        sendPasswordResetEmail,
        verifyOtp,
        resendOtp,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
