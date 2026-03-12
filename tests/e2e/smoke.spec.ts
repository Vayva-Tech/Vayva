import { test, expect } from "@playwright/test";

const MERCHANT_A = { email: "e2e-merchant-a@vayva.test", password: "TestPass123!" };

test.describe("Vayva Smoke Tests", () => {
  // 1. Merchant Admin Login
  test("@smoke @merchant Merchant Admin: Login", async ({ page }) => {
    await page.goto("/signin");

    await page.getByTestId("auth-signin-email").fill(MERCHANT_A.email);
    await page.getByTestId("auth-signin-password").fill(MERCHANT_A.password);
    await page.getByTestId("auth-signin-submit").click();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.getByText(/Orders|Products/i).first()).toBeVisible();
  });

  // 2. Broken Route Check
  test("@smoke @merchant Security: Merchant Admin has no legacy /admin routes", async ({
    page,
  }) => {
    await page.goto("/admin");
    // Next.js 404 page usually contains "404"
    await expect(page.getByText("404")).toBeVisible();
  });
});
