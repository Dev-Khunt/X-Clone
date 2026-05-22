import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:4000",
      "/users": "http://localhost:4000",
      "/tweets": "http://localhost:4000",
      "/retweets": "http://localhost:4000",
      "/follows": "http://localhost:4000",
      "/comments": "http://localhost:4000",
      "/reactions": "http://localhost:4000",
      "/search": "http://localhost:4000",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
