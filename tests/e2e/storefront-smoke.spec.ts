import { test, expect } from "@playwright/test";

test.describe("Storefront Smoke", () => {
  test("@smoke @storefront Storefront: health endpoint", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
  });

  test("@smoke @storefront Storefront: homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
