import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'merchant-admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3000',
      },
    },
    {
      name: 'storefront',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3001',
      },
    },
    {
      name: 'ops-console',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:3002',
      },
    },
  ],
  webServer: [
    {
      command: 'VAYVA_E2E_MODE=true pnpm --filter merchant-admin dev',
      url: 'http://127.0.0.1:3000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000,
    },
    {
      command: 'VAYVA_E2E_MODE=true pnpm --filter storefront dev',
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000,
    },
    {
      command: 'VAYVA_E2E_MODE=true pnpm --filter ops-console dev',
      url: 'http://127.0.0.1:3002/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000,
    },
  ],
});
