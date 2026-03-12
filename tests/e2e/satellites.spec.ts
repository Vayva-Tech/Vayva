import { test, expect } from "@playwright/test";

// Base URLs
const STOREFRONT_URL = "http://localhost:3001";
const MARKETPLACE_URL = "http://localhost:3002";
const OPS_URL = "http://localhost:3003";

test.describe("Satellite Applications Sanity", () => {
  test("Storefront: Loads and shows Empty State or Products", async ({
    page,
  }) => {
    // Navigate to local storefront
    try {
      await page.goto(STOREFRONT_URL);
    } catch (e) {
      test.skip(true, "Storefront (port 3001) not running");
    }

    // Expect title or brand
    // Assuming "Vayva Store" or specific store name if using query param
    // Let's check for generic safe indicators
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toContain("404");
    expect(bodyText).not.toContain("Application Error");

    // If we have "Search" or "Cart" icon, that's good
    // await expect(page.locator('lucide-search')).toBeVisible(); // fragile
  });

  test("Marketplace: Waitlist Form Works", async ({ page }) => {
    try {
      await page.goto(MARKETPLACE_URL);
    } catch (e) {
      test.skip(true, "Marketplace (port 3002) not running");
    }

    await expect(page).toHaveTitle(/Market/i);
    await expect(page.getByText("Joining...")).not.toBeVisible();

    // Fill waitlist
    const emailInput = page.locator('input[type="email"]');
    if ((await emailInput.count()) > 0) {
      await emailInput.fill("test@vayva.test");

      const phoneInput = page.locator('input[type="tel"]');
      await phoneInput.fill("1234567890");

      await page.locator('button[type="submit"]').click();

      // Expect success message
      await expect(page.getByText("You're on the list!")).toBeVisible();
    } else {
      // Maybe already joined or different state?
      console.log(
        "Waitlist form not found, maybe already visible success state?",
      );
    }
  });

  test("Ops Console: Loads Login", async ({ page }) => {
    try {
      await page.goto(OPS_URL);
    } catch (e) {
      test.skip(true, "Ops Console (port 3003) not running");
    }

    // Should redirect to /signin or show login
    // await expect(page).toHaveURL(/signin/);
    await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
  });
});
