/**
 * Environment configuration
 */
const getApiBaseUrl = () => {
  // Check if we have an explicit environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In development, use the Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // In production, call the Railway backend directly
  return 'https://store-sicua-back-production.up.railway.app/api';
  // store-sicua-back-production.up.railway.app
  //return 'http://localhost:8080/api'; // Fallback for local development
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
