import { test, expect } from "@playwright/test";
import { DASHBOARD_ROUTES } from "../routes";
import { createAuthenticatedMerchantContext, cleanupTestUsers, } from "../helpers";
test.describe("Dashboard Navigation Guard", () => {
    test.afterAll(async () => {
        await cleanupTestUsers();
    });
    test.describe("Unauthenticated Access", () => {
        for (const route of DASHBOARD_ROUTES) {
            test(`unauth access to ${route} redirects to login`, async ({ page }) => {
                await page.goto(route);
                // Expect redirect to login
                await expect(page).toHaveURL(/\/(signin|login)/);
            });
        }
    });
    test.describe("Authenticated Access", () => {
        test("authenticated user can access dashboard and navigate", async ({ page, }) => {
            // Create authenticated merchant
            await createAuthenticatedMerchantContext(page);
            // Navigate to dashboard
            await page.goto("/dashboard");
            await page.waitForLoadState("networkidle");
            // Verify we're on dashboard (not redirected to login)
            await expect(page).toHaveURL(/\/dashboard/);
            // Check that navigation links exist
            const navLinks = page.locator('nav a, [role="navigation"] a');
            const count = await navLinks.count();
            expect(count).toBeGreaterThan(0);
            // Verify at least some key navigation elements are visible
            const visibleLinks = await navLinks.filter({ hasText: /.+/ }).count();
            expect(visibleLinks).toBeGreaterThan(0);
        });
        test("can navigate between dashboard sections", async ({ page }) => {
            await createAuthenticatedMerchantContext(page);
            // Test navigation to different sections
            const sections = ["/dashboard", "/dashboard/orders", "/dashboard/products"];
            for (const section of sections) {
                await page.goto(section);
                await page.waitForLoadState("networkidle");
                // Verify we're on the correct page (not redirected)
                await expect(page).toHaveURL(new RegExp(section));
            }
        });
    });
});
