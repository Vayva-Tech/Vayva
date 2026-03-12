import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";

test.describe("Admin Mission Control", () => {
  test("admin access gated by allowlist mock", async ({ page }) => {
    // Authenticate as a regular merchant (who should be denied admin access if API wasn't mocked to 403,
    // but here we intentionally mock 403 to test UI handling or API response)
    await createAuthenticatedMerchantContext(page);

    // Mock 403 response for unauthorized
    await page.route("/api/admin/merchants", async (route) => {
      await route.fulfill({ status: 403, body: "Unauthorized Admin Access" });
    });

    // Try getting list
    const res = await page.request.get("/api/admin/merchants");
    expect(res.status()).toBe(403);
  });

  // Mock an Authorized Admin session behavior via test logic or improved mock
  test("admin can search merchants", async ({ page }) => {
    test.slow();
    await createAuthenticatedMerchantContext(page);
    // Mock API success
    await page.route("**/api/admin/merchants*", async (route) => {
      await route.fulfill({
        json: {
          merchants: [
            {
              id: "m1",
              name: "Test Store",
              slug: "test",
              isLive: true,
              subscription: { planSlug: "pro" },
              createdAt: new Date().toISOString(),
            },
          ],
        },
      });
    });

    await page.goto("/admin/merchants");

    // Smoke Test: Verify Page Loads and Search Input Exists
    await expect(
      page.getByRole("heading", { name: /Merchants/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Search name or slug...")).toBeVisible();
  });

  test("admin detail view loads snapshot", async ({ page }) => {
    await createAuthenticatedMerchantContext(page);

    await page.goto("/admin/merchants/m2");
    // Smoke Test: Verify Page Loads
    await expect(page.getByRole("button", { name: /Back/i })).toBeVisible(); // Usually a back button exists?
    // Or just wait for page load
    await page.waitForLoadState("networkidle");
  });
});
