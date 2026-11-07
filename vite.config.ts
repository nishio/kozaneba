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
    // Unit tests live under src/. Keep vitest out of playwright/ (run by
    // Playwright: `npm run test:replay`, and the iPad smoke from #57).
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
