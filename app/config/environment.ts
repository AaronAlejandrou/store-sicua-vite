/**
 * Environment Configuration for SICUA Frontend
 * 
 * Centralizes all environment-dependent settings for the React application.
 * Handles development, staging, and production configurations.
 * 
 * Backend Connection Strategy:
 * - Development: Vite proxy to localhost:8080 (configured in vite.config.ts)
 * - Production: Direct connection to Railway deployment
 * - Custom: Environment variable override (VITE_API_BASE_URL)
 * 
 * Key Integrations:
 * - API Base URL for backend communication
 * - Railway production deployment
 * - Local development proxy setup
 * 
 * @see vite.config.ts for development proxy configuration
 * @see HttpClient.ts for API communication implementation
 */

/**
 * Determines the appropriate API base URL based on environment
 * 
 * Priority Order:
 * 1. VITE_API_BASE_URL environment variable (highest priority)
 * 2. Development proxy (/api) for local development
 * 3. Railway production URL (default production)
 * 
 * Development Flow:
 * 1. Frontend runs on localhost:3000 (Vite dev server)
 * 2. API calls go to /api/* (relative URLs)
 * 3. Vite proxy forwards to localhost:8080/api/*
 * 4. Backend processes requests and returns responses
 * 
 * Production Flow:
 * 1. Frontend served from production URL
 * 2. API calls go directly to Railway backend
 * 3. CORS headers allow cross-origin requests
 */
const getApiBaseUrl = () => {
  // Check if we have an explicit environment variable (deployment override)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In development, use the Vite proxy for seamless local development
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // In production, connect directly to Railway backend deployment
  return 'https://store-sicua-back-production.up.railway.app/api';
  // store-sicua-back-production.up.railway.app
  //return 'http://localhost:8080/api'; // Fallback for local development
};

/**
 * Environment Configuration Object
 * Contains all environment-specific settings for the application
 */
export const config = {
  /**
   * Backend API base URL
   * Used by HttpClient for all API communications
   * Automatically switches between development proxy and production URL
   */
  apiBaseUrl: getApiBaseUrl(),
  
  /**
   * Environment detection flags
   * Useful for conditional features, logging, and debugging
   */
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  /**
   * Build mode information
   * Can be 'development', 'production', or custom modes
   */
  mode: import.meta.env.MODE,
};
