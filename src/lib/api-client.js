// src/lib/api-client.js
import axios from "axios";
import { getCookie, setCookie, removeAuthTokens } from "../utils/cookie-utils";

// Use environment variable for API URL or default to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4500/api";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token from cookies if available
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);

    // Get access token from cookie and add it to the Authorization header
    const accessToken = getCookie("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("Adding Authorization header with access token");
    }

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// For token refresh mechanism
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for handling common error scenarios
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error("API Response Error:", error.response?.data || error.message);

    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;

      // If this request hasn't been retried yet and isn't the refresh token endpoint itself
      if (
        !originalRequest._retry &&
        !originalRequest.url.includes("/auth/refresh-token")
      ) {
        if (isRefreshing) {
          try {
            const token = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return await axios(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        // Mark this request as retried
        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getCookie("refreshToken");
        if (!refreshToken) {
          // No refresh token available, clear auth state and redirect
          clearAuthState();
          return Promise.reject(error);
        }

        // Try to get a new access token using the refresh token
        try {
          const response = await apiClient.get(
            `/auth/refresh-token?refreshToken=${refreshToken}`
          );
          // const response = await apiClient.post("/auth/refresh-token", {
          //   refreshToken,
          // });
          const { accessToken } = response.data.data;
          setCookie("accessToken", accessToken, { maxAge: 30 * 24 * 60 * 60 });

          // Update authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return axios(originalRequest);
        } catch (err) {
          processQueue(err, null);
          // Token refresh failed, clear auth state
          clearAuthState();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to clear auth state
function clearAuthState() {
  console.log("Clearing authentication state");
  removeAuthTokens();
}

export default apiClient;
