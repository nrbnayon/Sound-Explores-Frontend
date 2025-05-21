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
          console.log("Get user:::", response);
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

  useEffect(() => {
    if (location.pathname === ROUTES.SEND_CODE) {
      if (!location.state?.email) {
        console.log(
          "No email provided for verification, redirecting to signup"
        );
        navigate(ROUTES.HOME);
      }
    }
  }, [location, navigate]);

  // Sign in function
  const signIn = async (credentials) => {
    try {
      setLoading(true);
      console.log("Signing in with:", credentials.email);

      const response = await apiClient.post("/auth/login", credentials);
      console.log("Sign in response:", response.data);

      if (response) {
        const { accessToken, refreshToken } = response.data.data;
        setAuthTokens(accessToken, refreshToken);
        const userData = await apiClient.get("/user/me");
        console.log("Get user check auth:::", response);
        checkAuth();
        setUser(userData.data.data);
      }
      // Set auth tokens in cookies

      // Store user data in state

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

      // Start verification process
      if (response.data.success) {
        setVerificationInProgress(true);
        toast.success(
          response?.data?.message ||
            `Account created successfully!  Please check your email ${userData?.email} for code.`
        );
        // Pass the email in the state
        navigate(ROUTES.SEND_CODE, { state: { email: userData.email } });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Sign up error:", error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        // Display first validation error as toast
        toast.error(validationErrors[0]?.message || "Validation failed");
      } else if (error.response?.data?.message) {
        // Handle case where email already exists
        if (error.response?.data?.message.includes("email already exist")) {
          setVerificationInProgress(true);
          resendOtp(userData.email);
          navigate(ROUTES.SEND_CODE, { state: { email: userData.email } });
          toast.warn(
            "This email is already registered. Verification code resent."
          );
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

  // Sign out function
  const signOut = async () => {
    try {
      console.log("Signing out user");
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

  // Request password reset
  const sendPasswordResetEmail = async (email) => {
    try {
      setLoading(true);
      console.log("Requesting password reset for:", email);

      const response = await apiClient.patch("/auth/forgot-password-request", {
        email,
      });
      console.log("Get response Forget Pass::", response);

      // Based on your API response structure
      if (response?.data?.success) {
        setVerificationInProgress(true);
        // Explicitly pass the email in state for the next page and mark as password reset flow
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
        // Fallback success handling
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

  // Verify OTP code
  const verifyOtp = async (email, otp) => {
    try {
      setLoading(true);
      console.log("Verifying OTP for:", email);

      if (!email || !otp) {
        throw new Error("Email and OTP are required");
      }

      const response = await apiClient.patch("/auth/verify-user", {
        email,
        otp,
      });
      console.log("OTP verification response:", response.data);

      // Mark verification as complete
      setVerificationInProgress(false);
      toast.success("Your account verified successfully");

      const isPasswordReset = location.state?.fromPasswordReset;

      const authToken = response.data?.data?.token || response.data?.token;

      if (isPasswordReset && authToken) {
        // Navigate to reset password with token for password reset flow
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

  // Resend OTP code
  const resendOtp = async (email) => {
    try {
      setLoading(true);
      console.log("Resending OTP for:", email);

      if (!email) {
        throw new Error("Email is required");
      }

      const response = await apiClient.patch("/auth/resend-code", { email });
      console.log("Resend OTP response:", response.data);

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
      console.log("Resetting password with token");

      // Use the token in the Authorization header
      const response = await apiClient.patch(
        "/auth/reset-password",
        passwords,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
        "/user/update-profile-data",
        profileData
      );

      console.log("Update profile response:", response.data);

      if (response?.data?.success) {
        // Get the updated user data from the response
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

        // Wait for state update to complete before navigating
        setTimeout(() => {
          toast.success("Profile updated successfully");
          // navigate(ROUTES.PROFILE, { replace: true });
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
