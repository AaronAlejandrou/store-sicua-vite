/**
 * Environment configuration - Development only
 */
export const config = {
  apiBaseUrl: '/api',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
