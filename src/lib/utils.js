import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine class names with Tailwind CSS
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

// Truncate text with ellipsis
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Generate random ID
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, length + 2);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validate email
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}