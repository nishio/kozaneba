import { defineConfig, devices } from "@playwright/test";

// Replays touch sessions recorded on a real iPad (see src/Recorder/).
// Chromium, because only the DevTools protocol can feed multi-finger touch
// through real hit-testing.
//
//   PW_BASE_URL=http://localhost:3200 npm run test:replay   # existing server
//   npm run test:replay                                     # starts vite
const port = 3200;
const baseURL = process.env.PW_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./playwright/replay",
  timeout: 120_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL, hasTouch: true, trace: "off", video: "off" },
  projects: [{ name: "replay-chromium", use: { ...devices["Desktop Chrome"], hasTouch: true } }],
  webServer: process.env.PW_BASE_URL
    ? undefined
    : {
        command: `npx vite --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
