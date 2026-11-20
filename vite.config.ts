import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Listen on the LAN so the app can be opened from a phone on the same Wi-Fi.
  server: {
    host: true,
    allowedHosts: true,
  },
  // Pre-bundle chart dependencies so a dev-server restart after installing
  // packages does not leave stale `node_modules/.vite` chunks behind.
  optimizeDeps: {
    include: ["recharts"],
  },
})
