import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vite Configuration for SICUA Frontend
 * 
 * This configuration sets up:
 * - React Router v7 for client-side routing
 * - Tailwind CSS for utility-first styling
 * - TypeScript path mapping for clean imports
 * - Development server proxy for backend communication
 * 
 * Development Proxy Strategy:
 * - Frontend: localhost:5173 (Vite dev server)
 * - Backend: localhost:8080 (Spring Boot)
 * - Proxy: /api/* → http://localhost:8080/*
 * - Path rewriting: /api/products → /products (backend endpoint)
 * 
 * Key Benefits:
 * 1. No CORS issues during development
 * 2. Seamless full-stack development experience
 * 3. Production-like request routing
 * 4. Environment variable support
 * 
 * @see app/config/environment.ts for API URL configuration
 * @see app/infrastructure/http/HttpClient.ts for API client implementation
 */
export default defineConfig({
  /**
   * Plugin Configuration
   * Integrates essential tools and frameworks
   */
  plugins: [
    // Tailwind CSS for utility-first styling
    tailwindcss(),
    
    // React Router v7 for modern client-side routing
    reactRouter(),
    
    // TypeScript path mapping for clean imports (@ prefix support)
    tsconfigPaths(),
  ],
  
  /**
   * Development Server Configuration
   * Handles local development setup and backend integration
   */
  server: {
    port: 5173, // Standard Vite port
    host: true, // Allow external connections for network testing
    
    /**
     * Proxy Configuration for Backend API
     * 
     * Routes all /api/* requests to the Spring Boot backend
     * This eliminates CORS issues and provides seamless development
     * 
     * Flow:
     * 1. Frontend makes request to /api/products
     * 2. Vite proxy intercepts the request
     * 3. Rewrites path: /api/products → /products
     * 4. Forwards to localhost:8080/products
     * 5. Spring Boot processes the request
     * 6. Response is forwarded back to frontend
     * 
     * Alternative: Railway production backend (commented out)
     */
    proxy: {
      '/api': {
        // Local development target (Spring Boot on port 8080)
        target: 'http://localhost:8080/api',
        
        // Alternative: Railway production backend
        //target: 'https://store-sicua-back-production.up.railway.app',
        
        // Essential proxy options
        changeOrigin: true, // Changes the origin of the host header to the target URL
        secure: false, // Allow self-signed certificates (development only)
        //secure: true, // Set to false if using the deployed frontend
        
        /**
         * Path Rewriting Strategy
         * Removes /api prefix before forwarding to backend
         * 
         * Examples:
         * /api/products → /products
         * /api/sales → /sales
         * /api/categories → /categories
         */
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  
  /**
   * Build-time Environment Variables
   * Makes environment variables available at compile time
   */
  define: {
    // Inject VITE_API_BASE_URL into the build
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
  
  /**
   * Build Configuration
   * Optimizes the production build
   */
  build: {
    // Generate source maps for better debugging in production
    sourcemap: true,
    
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@react-router/dev'],
          ui: ['tailwindcss'],
        },
      },
    },
  },
});
