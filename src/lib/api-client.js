// src/lib/api-client.js
import axios from "axios";
import { getCookie, setCookie, removeAuthTokens } from "../utils/cookie-utils";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4500/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Define endpoints that should NOT have automatic Bearer token
const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/user/create-user",
  "/auth/forgot-password-request",
  "/auth/verify-user",
  "/auth/resend-code",
  "/auth/refresh-token",
];

// Helper function to check if endpoint is public
const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Helper function to clear all auth cookies
const clearAllAuthCookies = () => {
  const authCookies = ["accessToken", "refreshToken", "isAuthenticated"];
  authCookies.forEach((cookieName) => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
};

// Define clearAuthState function before using it
function clearAuthState() {
  removeAuthTokens();
}

apiClient.interceptors.request.use(
  (config) => {
    // Clear auth cookies for manual auth endpoints to prevent OAuth conflicts
    if (
      config.url.includes("/user/create-user") ||
      config.url.includes("/auth/login")
    ) {
      console.log("Clearing auth cookies for manual auth endpoint");
      clearAllAuthCookies();
    }

    // Only add Bearer token for protected endpoints
    if (!isPublicEndpoint(config.url)) {
      const accessToken = getCookie("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

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

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("API Response Error:", error.response?.data || error.message);

    if (error?.response?.data?.message?.includes("You are not authorized")) {
      console.error("Invalid token detected, clearing auth state");
      clearAuthState();
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;

      // Don't retry public endpoints
      if (isPublicEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }

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

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getCookie("refreshToken");
        if (!refreshToken) {
          clearAuthState();
          return Promise.reject(error);
        }

        try {
          const response = await apiClient.get(
            `/auth/refresh-token?refreshToken=${refreshToken}`
          );
          const { accessToken } = response.data.data;
          setCookie("accessToken", accessToken, { maxAge: 30 * 24 * 60 * 60 });
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return axios(originalRequest);
        } catch (err) {
          processQueue(err, null);
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

export default apiClient;

// // src/lib/api-client.js
// import axios from "axios";
// import { getCookie, setCookie, removeAuthTokens } from "../utils/cookie-utils";
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4500/api";

// const apiClient = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// apiClient.interceptors.request.use(
//   (config) => {
//     const accessToken = getCookie("accessToken");
//     if (accessToken) {
//       config.headers.Authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     console.error("API Request Error:", error);
//     return Promise.reject(error);
//   }
// );

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });

//   failedQueue = [];
// };

// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     console.error("API Response Error:", error.response?.data || error.message);
//     if (error?.response?.data?.message.includes("You are not authorized")) {
//       console.error("Invalid token detected, clearing auth state");
//       removeAuthTokens();
//       clearAuthState();
//     }
//     if (error.response && error.response.status === 401) {
//       const originalRequest = error.config;
//       if (
//         !originalRequest._retry &&
//         !originalRequest.url.includes("/auth/refresh-token")
//       ) {
//         if (isRefreshing) {
//           try {
//             const token = await new Promise((resolve, reject) => {
//               failedQueue.push({ resolve, reject });
//             });
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             return await axios(originalRequest);
//           } catch (err) {
//             return Promise.reject(err);
//           }
//         }

//         originalRequest._retry = true;
//         isRefreshing = true;

//         const refreshToken = getCookie("refreshToken");
//         if (!refreshToken) {
//           clearAuthState();
//           return Promise.reject(error);
//         }

//         try {
//           const response = await apiClient.get(
//             `/auth/refresh-token?refreshToken=${refreshToken}`
//           );
//           const { accessToken } = response.data.data;
//           setCookie("accessToken", accessToken, { maxAge: 30 * 24 * 60 * 60 });
//           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//           processQueue(null, accessToken);
//           return axios(originalRequest);
//         } catch (err) {
//           processQueue(err, null);
//           clearAuthState();
//           return Promise.reject(err);
//         } finally {
//           isRefreshing = false;
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// function clearAuthState() {
//   removeAuthTokens();
// }

// export default apiClient;
