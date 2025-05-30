import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
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
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);

      if (
        hasCookie("isAuthenticated") &&
        (hasCookie("accessToken") || hasCookie("refreshToken"))
      ) {
        try {
          const response = await apiClient.get("/user/me");
          setUser(response.data.data);
        } catch (error) {
          console.error("Error fetching user profile:", error);

          if (error.response && error.response.status === 401) {
            removeAuthTokens();
            setUser(null);
          }
        }
      } else {
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

  useEffect(() => {
    if (location.pathname === ROUTES.SEND_CODE) {
      if (!location.state?.email) {
        navigate(ROUTES.HOME);
      }
    }
  }, [location, navigate]);

  // Sign in function
  const signIn = async (credentials) => {
    try {
      setLoading(true);

      const response = await apiClient.post("/auth/login", credentials);

      if (response) {
        const { accessToken, refreshToken } = response.data.data;
        setAuthTokens(accessToken, refreshToken);
        const userData = await apiClient.get("/user/me");
        checkAuth();
        setUser(userData.data.data);
      }

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

  // Simplified sign up function - same flow as sign in
  const signUp = async (userData) => {
    try {
      setLoading(true);
      console.log("Sign up data:", userData);
      const response = await apiClient.post("/user/create-user", userData);

      console.log("Sign up response:", response);

      if (response.data.success) {
        // If backend returns tokens directly (same as sign in)
        if (
          response.data.data?.accessToken &&
          response.data.data?.refreshToken
        ) {
          const { accessToken, refreshToken } = response.data.data;
          setAuthTokens(accessToken, refreshToken);
          const userDataResponse = await apiClient.get("/user/me");
          setUser(userDataResponse.data.data);

          toast.success("Account created successfully!");
          navigate(ROUTES.SOUND_LIBRARY);
          return true;
        }

        // If backend still returns success but no tokens, handle accordingly
        toast.success(
          response?.data?.message || "Account created successfully!"
        );

        // Try to sign in immediately with the same credentials
        return await signIn({
          email: userData.email,
          password: userData.password,
        });
      }
      return false;
    } catch (error) {
      console.error("Sign up error:", error);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.message;
        toast.error(validationErrors || "Validation failed");
      } else if (error.response?.data?.message) {
        if (error.response?.data?.message.includes("email already exist")) {
          toast.warn(
            "This email is already registered. Please sign in instead."
          );
          navigate(ROUTES.SIGNIN);
        } else {
          toast.error(
            error.response.data.message || "Failed to create account"
          );
        }
      } else {
        toast.error("An unexpected error occurred");
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      removeAuthTokens();
      setUser(null);
      setVerificationInProgress(false);
      queryClient.clear();
      toast.success("Successfully signed out");
      navigate(ROUTES.SIGNIN);
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      setLoading(true);
      const response = await apiClient.patch("/auth/forgot-password-request", {
        email,
      });
      if (response?.data?.success) {
        setVerificationInProgress(true);
        navigate(ROUTES.SEND_CODE, {
          state: {
            email: email,
            fromPasswordReset: true,
          },
          replace: false,
        });
        toast.success(
          response?.data?.message ||
            `Check your email ${email}, we've sent verification OTP Code`
        );
        return true;
      } else {
        toast.success(
          response?.data?.message || `Verification code sent to ${email}`
        );
        setVerificationInProgress(true);
        navigate(ROUTES.SEND_CODE, {
          state: {
            email: email,
            fromPasswordReset: true,
          },
          replace: false,
        });
        return true;
      }
    } catch (error) {
      console.error("Send reset email error:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to send reset email";
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP code (kept for password reset functionality)
  const verifyOtp = async (email, otp) => {
    try {
      setLoading(true);
      if (!email || !otp) {
        throw new Error("Email and OTP are required");
      }
      const response = await apiClient.patch("/auth/verify-user", {
        email,
        otp,
      });

      setVerificationInProgress(false);
      toast.success("Your account verified successfully");
      const isPasswordReset = location.state?.fromPasswordReset;
      const authToken = response.data?.data?.token || response.data?.token;

      if (isPasswordReset && authToken) {
        navigate(ROUTES.RESET_PASSWORD, {
          state: {
            email,
            token: authToken,
          },
        });
      }

      return response.data;
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.response?.data?.message || "Invalid OTP code");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code (kept for password reset functionality)
  const resendOtp = async (email) => {
    try {
      setLoading(true);
      if (!email) {
        throw new Error("Email is required");
      }
      const response = await apiClient.patch("/auth/resend-code", { email });

      toast.success("Verification code resent successfully");
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
  const resetPassword = async (passwords, token) => {
    try {
      setLoading(true);
      const response = await apiClient.patch(
        "/auth/reset-password",
        passwords,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

      const response = await apiClient.patch(
        "/auth/update-password",
        passwords
      );

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
      const response = await apiClient.patch(
        "/user/update-profile-data",
        profileData
      );

      if (response?.data?.success) {
        const updatedUser = response.data.data || response.data.user;
        setUser((prevUser) => {
          return {
            ...prevUser,
            email: profileData.email || prevUser.email,
            phone: profileData.phone || prevUser.phone,
            profile: {
              ...prevUser.profile,
              fullName: profileData.fullName || prevUser.profile?.fullName,
              nickname: profileData.nickname || prevUser.profile?.nickname,
              dateOfBirth:
                profileData.dateOfBirth || prevUser.profile?.dateOfBirth,
              address: profileData.address || prevUser.profile?.address,
              ...(updatedUser?.profile || {}),
            },
            ...(updatedUser || {}),
          };
        });

        setTimeout(() => {
          toast.success("Profile updated successfully");
        }, 100);
        return true;
      }
      return false;
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
        verificationInProgress,
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
