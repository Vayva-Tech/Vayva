import { test, expect } from "@playwright/test";

test.describe("@merchant Merchant Auth (Full)", () => {
  test("@merchant can sign in (OTP if required)", async ({ page }) => {
    await page.goto("/signin");

    await page.getByTestId("auth-signin-email").fill("e2e-merchant-a@vayva.test");
    await page.getByTestId("auth-signin-password").fill("TestPass123!");
    await page.getByTestId("auth-signin-submit").click();

    await page.waitForLoadState("networkidle");

    if (/\/verify(\?|$)/.test(page.url())) {
      await expect(page.getByTestId("auth-verify-otp-container")).toBeVisible({ timeout: 15000 });

      const otp = "123456";
      for (let i = 0; i < otp.length; i++) {
        await page.getByLabel(`Digit ${i + 1}`).fill(otp[i]);
      }

      await page.getByTestId("auth-verify-submit").click();
    }

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 20000 });
    await expect(page.getByText(/Orders|Products/i).first()).toBeVisible();
  });
});
