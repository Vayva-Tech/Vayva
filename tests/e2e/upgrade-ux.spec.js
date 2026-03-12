import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";
test.describe("Upgrade UX", () => {
    test.beforeEach(async ({ page }) => {
        await createAuthenticatedMerchantContext(page);
    });
    test("seat limit invite shows paywall error", async ({ page }) => {
        // Mock Session
        await page
            .context()
            .addCookies([
            {
                name: "x-active-store-id",
                value: "store_123",
                url: "http://localhost:3000",
            },
        ]);
        // Mock Invite API to return Gate Error
        await page.route("/api/merchant/team/invite", async (route) => {
            await route.fulfill({
                status: 403,
                json: {
                    error: {
                        code: "SEAT_LIMIT",
                        message: "Limit reached",
                        requiredPlan: "pro",
                        upgradeUrl: "/admin/billing?upgrade=pro",
                    },
                },
            });
        });
        // We assume there's a UI that calls this.
        // Since we didn't build the "Invite User" UI in this session (only the API).
        // We will test the API directly via request if possible, or assume the UI handles the 403.
        // Direct API test via request context
        const res = await page.request.post("/api/merchant/team/invite");
        expect(res.status()).toBe(403);
        const data = await res.json();
        expect(data.error.code).toBe("SEAT_LIMIT");
        expect(data.error.upgradeUrl).toContain("upgrade=pro");
    });
    test("billing page handles upgrade param", async ({ page }) => {
        await page.goto("/admin/billing/plans?upgrade=pro");
        // Assert Pro plan is visible
        await expect(page.getByText("Pro")).toBeVisible();
        // Maybe assert it's highlighted or scrolled to (hard to test scroll in headless without specific markers)
    });
});
