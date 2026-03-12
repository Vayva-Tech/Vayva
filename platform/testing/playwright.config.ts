import { defineConfig, devices } from "@playwright/test";

type E2ETarget = "merchant-admin" | "storefront" | "ops-console" | "all";

const e2eTarget = (process.env.VAYVA_E2E_TARGET || "all") as E2ETarget;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    ...(e2eTarget === "all" || e2eTarget === "merchant-admin"
      ? [
          {
            name: "merchant-admin",
            use: {
              ...devices["Desktop Chrome"],
              baseURL: "http://127.0.0.1:3000",
            },
          },
        ]
      : []),
    ...(e2eTarget === "all" || e2eTarget === "storefront"
      ? [
          {
            name: "storefront",
            use: {
              ...devices["Desktop Chrome"],
              baseURL: "http://127.0.0.1:3001",
            },
          },
        ]
      : []),
    ...(e2eTarget === "all" || e2eTarget === "ops-console"
      ? [
          {
            name: "ops-console",
            use: {
              ...devices["Desktop Chrome"],
              baseURL: "http://127.0.0.1:3002",
            },
          },
        ]
      : []),
  ],
  webServer: [
    ...(e2eTarget === "all" || e2eTarget === "merchant-admin"
      ? [
          {
            command:
              "VAYVA_E2E_MODE=true pnpm --dir ../../Frontend/merchant-admin dev",
            url: "http://127.0.0.1:3000/api/health",
            reuseExistingServer: !process.env.CI,
            timeout: 300 * 1000,
          },
        ]
      : []),
    ...(e2eTarget === "all" || e2eTarget === "storefront"
      ? [
          {
            command:
              "VAYVA_E2E_MODE=true STOREFRONT_ALLOWED_HOST_SUFFIXES=localhost pnpm --dir ../../Frontend/storefront exec next dev --webpack -p 3001",
            url: "http://127.0.0.1:3001/api/health",
            reuseExistingServer: !process.env.CI,
            timeout: 300 * 1000,
          },
        ]
      : []),
    ...(e2eTarget === "all" || e2eTarget === "ops-console"
      ? [
          {
            command: "VAYVA_E2E_MODE=true pnpm --dir ../../Frontend/ops-console dev",
            url: "http://127.0.0.1:3002/api/health",
            reuseExistingServer: !process.env.CI,
            timeout: 300 * 1000,
          },
        ]
      : []),
  ],
});
