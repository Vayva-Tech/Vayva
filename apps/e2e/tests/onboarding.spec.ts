// This is a skeleton E2E test for onboarding flow using Playwright
// It should be wired into your CI when Playwright tests are set up.
import { test, expect } from "@playwright/test";

test.describe("Merchant Onboarding Flow", () => {
  test("New merchant onboarding should progress through steps", async ({
    page,
  }) => {
    // Navigate to onboarding start (adjust baseURL if needed)
    await page.goto("http://localhost:3000/onboarding");
    // Basic assertions to ensure the page renders and the banner is present
    await expect(page.locator('[aria-label="Onboarding note"]')).toBeVisible();
    // Add further steps when stubs are implemented in the UI
  });
});
