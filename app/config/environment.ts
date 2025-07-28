/**
 * Environment configuration
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || (
    typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? 'https://store-sicua-back-production.up.railway.app/api'
      : '/api'
  ),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
