import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";

test.describe("Onboarding Smoke Test", () => {
  test("onboarding welcome page loads", async ({ page }) => {
    // Set onboardingStatus to NOT_STARTED
    await createAuthenticatedMerchantContext(page, {
      onboardingStatus: "NOT_STARTED",
    });

    // Mock the onboarding state to ensure we land on welcome
    await page.route("**/api/merchant/onboarding/state", async (route) => {
      await route.fulfill({
        json: {
          onboardingStatus: "IN_PROGRESS",
          currentStep: "welcome",
          completedSteps: [],
          data: {},
        },
      });
    });

    // Go to onboarding
    await page.goto("/onboarding");

    // Should eventually be on welcome page
    // We use a more flexible matcher for text
    await expect(page.getByText(/Welcome/i).first()).toBeVisible({
      timeout: 15000,
    });

    // Check for specific button
    const continueBtn = page.getByRole("button", { name: /Continue/i });
    await expect(continueBtn).toBeVisible();
  });
});
