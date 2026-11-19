import { defineConfig, devices } from "@playwright/test";

const PORT = 3123;

/**
 * End-to-end verification against a production build (`pnpm build` first). Model calls are
 * mocked per test, so the suite needs no API key and is deterministic.
 * Locally, PW_CHROMIUM_PATH can point at an already installed Chromium.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "en-US",
    permissions: ["camera"],
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM_PATH || undefined,
      args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
    },
  },
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 7"], browserName: "chromium" } }],
  webServer: {
    command: `mkdir -p data && rm -f data/e2e.db && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: {
      TURSO_DATABASE_URL: "file:data/e2e.db",
      TURSO_AUTH_TOKEN: "e2e",
      ANTHROPIC_API_KEY: "e2e-not-used",
    },
  },
});
