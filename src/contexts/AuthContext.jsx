// src\contexts\AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { API_URL } from "../config/constants";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useLocalStorage("token", null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on component mount
  const checkAuth = useCallback(async () => {
    try {
      if (token) {
        // For demonstration, we'll create a mock user
        // In a real application, you would verify the token with your API
        setUser({
          id: 1,
          name: "Daniel Austin",
          email: "daniel_austin@yourdomain.com",
          avatar: "/profile.png",
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]); // Only depend on token

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Depend on checkAuth instead of token and setToken

  // Sign in function
  const signIn = async (credentials) => {
    try {
      setLoading(true);
      // In a real application, you would make an API call here
      // const response = await axios.post(`${API_URL}/auth/login`, credentials);

      // Mock successful login
      const mockResponse = {
        data: {
          user: {
            id: 1,
            name: "Daniel Austin",
            email: credentials.email,
            avatar: "/profile.png",
          },
          token: "mock-jwt-token",
        },
      };

      setUser(mockResponse.data.user);
      setToken(mockResponse.data.token);
      toast.success("Successfully signed in!");
      navigate("/sound-library");
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
      // In a real application, you would make an API call here
      // const response = await axios.post(`${API_URL}/auth/register`, userData);

      // Mock successful registration
      const mockResponse = {
        data: {
          user: {
            id: 1,
            name: userData.name,
            email: userData.email,
            avatar: "/profile.png",
          },
          token: "mock-jwt-token",
        },
      };

      setUser(mockResponse.data.user);
      setToken(mockResponse.data.token);
      toast.success("Account created successfully!");
      navigate("/sound-library");
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
  const signOut = () => {
    setUser(null);
    setToken(null);
    toast.success("Successfully signed out");
    navigate("/");
  };

  // Reset password function
  const resetPassword = async (data) => {
    try {
      setLoading(true);
      // Mock API call
      // await axios.post(`${API_URL}/auth/reset-password`, data);
      toast.success("Password reset successfully");
      navigate("/signin");
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Send password reset email
  const sendPasswordResetEmail = async (email) => {
    try {
      setLoading(true);
      // Mock API call
      // await axios.post(`${API_URL}/auth/forgot-password`, { email });
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
  const verifyOtp = async (otpCode) => {
    try {
      setLoading(true);
      // Mock API call
      // await axios.post(`${API_URL}/auth/verify-otp`, { otpCode });
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

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      // Mock API call
      // const response = await axios.put(`${API_URL}/user/profile`, profileData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // Mock successful update
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
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
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
