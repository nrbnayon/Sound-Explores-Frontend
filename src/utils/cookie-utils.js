// src/utils/cookie-utils.js

// Remove auth tokens by making a request to backend logout endpoint
export const removeAuthTokens = async () => {
  try {
    // Make request to backend to clear cookies
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include' // Important: include cookies
    });
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
  console.log("Auth tokens cleared");
};

// Check if user is authenticated by making a request to /me endpoint
export const checkAuthStatus = async () => {
  try {
    const response = await fetch('/api/user/me', {
      credentials: 'include'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};