// src\config\constants.js
// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

// Routes
export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  FORGET_PASSWORD: '/forget-password',
  RESET_PASSWORD: '/reset-password',
  SEND_CODE: '/send-code',
  SOUND_LIBRARY: '/sound-library',
  PROFILE: '/profile',
  EDIT_PROFILE: '/edit-profile',
  PRIVACY_POLICY: '/privacy-policy',
  PAYMENT: '/payment',
  CHAT_INTERFACE: '/chat-interface',
};

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  THEME: 'theme',
  USER: 'user',
};

// Animation durations
export const ANIMATION = {
  DURATION: 0.3,
  EASE: [0.25, 0.1, 0.25, 1],
};