// src/utils/cookie-utils.js

// Remove auth tokens by making a request to backend logout endpoint
export const removeAuthTokens = async () => {
  try {
    // First, call backend logout to clear httpOnly cookies
    await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:4500/api"
      }/auth/logout`,
      {
        method: "POST",
        credentials: "include", // Important for cookies
      }
    );

    // Then clear any client-side accessible cookies
    const cookiesToClear = ["accessToken", "refreshToken", "isAuthenticated"];
    const domains = [window.location.hostname, "localhost", "127.0.0.1"];

    cookiesToClear.forEach((cookieName) => {
      // Clear for different domain/path combinations
      domains.forEach((domain) => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        document.cookie = `${cookieName}=; max-age=0; path=/; domain=${domain}`;
        document.cookie = `${cookieName}=; max-age=0; path=/`;
      });
    });

    console.log("Auth tokens cleared successfully");
  } catch (error) {
    console.error("Error clearing cookies:", error);
    // Still try to clear client-side cookies even if backend call fails
    const cookiesToClear = ["accessToken", "refreshToken", "isAuthenticated"];
    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; max-age=0; path=/;`;
    });
  }
};

// Check if user is authenticated by making a request to /me endpoint
export const checkAuthStatus = async () => {
  try {
    const response = await fetch("/api/user/me", {
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
