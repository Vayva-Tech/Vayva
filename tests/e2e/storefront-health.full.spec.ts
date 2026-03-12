import { test, expect } from "@playwright/test";

test.describe("@storefront Storefront (Full)", () => {
  test("@storefront health endpoint responds", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
  });

  test("@storefront homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
