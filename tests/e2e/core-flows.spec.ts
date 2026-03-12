import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";

test.describe("Core E2E Flows", () => {
  test.describe("Merchant Onboarding", () => {
    test("complete signup and onboarding wizard", async ({ page }) => {
      const email = `test-e2e-${Date.now()}@example.com`;

      await page.goto("/signup");
      await expect(page).toHaveURL(/signup/);

      // Fill signup form
      await page.fill('[data-testid="auth-signup-email"]', email);
      await page.fill('[data-testid="auth-signup-password"]', "SecurePass123!");
      await page.fill('input[id="confirmPassword"]', "SecurePass123!");
      await page.fill('input[id="firstName"]', "E2E");
      await page.fill('input[id="lastName"]', "Tester");
      await page.fill('input[id="businessName"]', "E2E Business");

      // Ensure checkbox is visible and click it
      const checkbox = page.locator('input[type="checkbox"]');
      await checkbox.check();

      // Submit
      const submitBtn = page.locator('[data-testid="auth-signup-submit"]');
      await page.screenshot({
        path: "signup-before-submit.png",
        fullPage: true,
      });
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: "signup-after-submit.png",
        fullPage: true,
      });

      // Check for potential error message
      const errorMsg = page.locator(".text-red-700");
      if (await errorMsg.isVisible()) {
        const text = await errorMsg.innerText();
        throw new Error(`Signup failed with error: ${text}`);
      }

      // Should redirect to verify
      await expect(page).toHaveURL(/verify/, { timeout: 15000 });

      // Enter OTP (bypass 123456)
      await page.locator('input[aria-label="Digit 1"]').focus();
      await page.keyboard.type("123456");

      // Verification is triggered automatically by onComplete in OTPInput

      // Should redirect to onboarding welcome
      await expect(page).toHaveURL(/onboarding\/welcome/);

      // Welcome page
      await page.click('[data-testid="segment-retail"]');
      await page.click('[data-testid="onboarding-welcome-continue"]');

      // Setup path (Assuming there's a continue button there)
      await expect(page).toHaveURL(/onboarding\/setup-path/);
      const continueBtn = page.getByRole("button", { name: /Continue/i });
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
      }

      // Business Basics
      await expect(page).toHaveURL(/onboarding\/business/);
      await page.fill('[data-testid="onboarding-business-name"]', "E2E Store");
      await page.click('[data-testid="onboarding-business-continue"]');

      // WhatsApp
      await expect(page).toHaveURL(/onboarding\/whatsapp/);
    });

    test("direct onboarding step access", async ({ page }) => {
      // Authenticate first
      await createAuthenticatedMerchantContext(page);

      await page.goto("/onboarding/business");
      const heading = page.locator("h1");
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/Business/i);
    });
  });

  test.describe("Product Management", () => {
    test("create product flow", async ({ page }) => {
      // Authenticate first
      await createAuthenticatedMerchantContext(page);

      await page.goto("/admin/products/new");

      // Wait for page load
      await expect(
        page.getByRole("heading", { name: "Add Product" }),
      ).toBeVisible();

      await page
        .getByPlaceholder("e.g. Vintage Denim Jacket")
        .fill("E2E Test Product");
      await page.getByPlaceholder("0.00").fill("5000");

      // Wait for save button and click
      await page.getByRole("button", { name: "Save Product" }).click();

      await expect(page).toHaveURL(/\/admin\/products/, { timeout: 15000 });
    });
  });

  test.describe("Storefront & Checkout", () => {
    test("market landing page", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
    });
  });
});
