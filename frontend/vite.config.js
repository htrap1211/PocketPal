import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API calls to the Express backend during dev so the key stays server-side.
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
