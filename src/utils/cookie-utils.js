// src/utils/cookie-utils.js
export const setCookie = (name, value, options = {}) => {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
  if (options.path) cookieString += `; Path=${options.path}`;
  if (options.secure) cookieString += `; Secure`;
  if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
  if (options.httpOnly) cookieString += `; HttpOnly`;

  document.cookie = cookieString;
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2
    ? decodeURIComponent(parts.pop().split(";").shift())
    : null;
};

export const removeCookie = (name, options = {}) => {
  setCookie(name, "", { ...options, maxAge: -1 });
};

export const setAuthTokens = (accessToken, refreshToken) => {
  const isProduction = import.meta.env.VITE_NODE_ENV === "production";

  const cookieOptions = {
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  };

  setCookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60, // 365 days
  });

  setCookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60, // 365 days
  });

  setCookie("isAuthenticated", "true", {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60, // 365 days
  });

  // console.log("Auth tokens set with expiration:");
  // console.log(" accessToken: 365 days");
  // console.log(" RToken: 365 days");
  // console.log(" accessToken: 365 days");
};

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

    const cookieOptions = { path: "/" };
    removeCookie("accessToken", cookieOptions);
    removeCookie("refreshToken", cookieOptions);
    removeCookie("isAuthenticated", cookieOptions);

    // Then clear any client-side accessible cookies
    const cookiesToClear = ["accessToken", "refreshToken", "isAuthenticated"];
    const domains = [
      window.location.hostname,
      "https://www.poopalert.online",
      "poopalert.online",
    ];

    cookiesToClear.forEach((cookieName) => {
      // Clear for different domain/path combinations
      domains.forEach((domain) => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        document.cookie = `${cookieName}=; max-age=0; path=/; domain=${domain}`;
        document.cookie = `${cookieName}=; max-age=0; path=/`;
      });
    });

    // console.log("Auth tokens cleared successfully");
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
