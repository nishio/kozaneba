import { defineConfig, devices } from "@playwright/test";

// iPad (WebKit) smoke harness for the "iPad で快適に動く" work (QUEUE K9+).
// Cypress cannot drive WebKit, so this is a separate, NON-required harness that
// emulates an iPad (hasTouch, viewport, devicePixelRatio) in real WebKit.
//
//   npm start -- --port 3100 --strictPort        # dev server
//   PW_BASE_URL=http://localhost:3100 npm run test:ipad
//
// It is intentionally kept out of the required CI for now; K9 only establishes
// the baseline (what works / breaks on iPad today).
const baseURL = process.env.PW_BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./playwright",
  // playwright/replay/ needs Chromium (CDP); it runs with playwright.replay.config.ts
  testIgnore: ["replay/**"],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "off",
    video: "off",
  },
  projects: [
    {
      name: "ipad-webkit",
      use: { ...devices["iPad (gen 7)"] },
    },
  ],
});
