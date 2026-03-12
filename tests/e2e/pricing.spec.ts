import { test, expect } from "@playwright/test";

// Strict requirements from prompt
const GROWTH_PRICE = "₦25,000";
const PRO_PRICE = "₦40,000";

test.describe("Pricing Guardrails", () => {
  test.skip("Landing Page must show correct strict pricing", async ({
    page,
  }) => {
    await page.goto("/");

    // Check for Growth Price
    const growthArg = page.getByText(GROWTH_PRICE).first();
    await expect(growthArg).toBeVisible();

    // Check for Pro Price
    const proArg = page.getByText(PRO_PRICE).first();
    await expect(proArg).toBeVisible();
  });

  test("Pricing Page must show correct strict pricing", async ({ page }) => {
    await page.goto("/pricing");

    // Check for Growth Price
    const growthArg = page.getByText(GROWTH_PRICE).first();
    await expect(growthArg).toBeVisible();

    // Check for Pro Price
    const proArg = page.getByText(PRO_PRICE).first();
    await expect(proArg).toBeVisible();
  });
});
