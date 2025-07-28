/**
 * Environment configuration
 */
const getApiBaseUrl = () => {
  // Priority: Environment variable > Production detection > Development proxy
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('Frontend hostname:', hostname);
    
    // If deployed (not localhost), use the Railway backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const apiUrl = 'https://store-sicua-back-production.up.railway.app/api';
      console.log('Using production API:', apiUrl);
      return apiUrl;
    }
  }
  
  // Development - use proxy
  console.log('Using development proxy: /api');
  return '/api';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

console.log('Environment config loaded:', config);
