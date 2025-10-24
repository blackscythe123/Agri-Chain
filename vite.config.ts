import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Load client-facing envs (VITE_*) from the server/.env directory
  envDir: path.resolve(__dirname, "./server"),
  server: {
    host: "::",
    port: 8000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/create-checkout-session": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/webhook": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
