import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    // Unit tests live under src/. Keep vitest out of playwright/ (iPad WebKit
    // smoke run by `npm run test:ipad`, not vitest).
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
