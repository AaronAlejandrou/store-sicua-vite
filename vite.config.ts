import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        //target: 'https://store-sicua-back-production.up.railway.app',
        changeOrigin: true,
        //secure: true, // Set to false if using the deployed frontend
        secure: false,
      },
    },
  },
  define: {
    // Make sure environment variables are available
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
});
