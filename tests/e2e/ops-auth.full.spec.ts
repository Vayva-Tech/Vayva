import { test, expect } from "@playwright/test";

test.describe("@ops Ops Auth (Full)", () => {
  test("@ops can sign in", async ({ page }) => {
    await page.goto("/ops/login");

    await page.getByLabel("Email address").fill("e2e-ops@vayva.test");
    await page.getByLabel("Password").fill("TestPass123!");
    await page.getByRole("button", { name: /Sign In|Login/i }).click();

    await expect(page).toHaveURL(/.*\/ops(\/|$)/, { timeout: 20000 });
    await expect(page.locator("body")).toBeVisible();
  });
});
