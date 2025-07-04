import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    allowedHosts: [
      "poopalert.fun",
      "api.poopalert.fun",
      "www.poopalert.fun",
      "poopalert.online",
      "www.poopalert.online",
      "api.poopalert.online",
      "poop-alert.com",
      "www.poop-alert.com",
      "api.poop-alert.com",
    ],
  },
});
