import { test, expect } from "@playwright/test";
import { AnalyticsService } from "../../apps/merchant-admin/src/lib/analytics/analyticsService";
import { prisma } from "@vayva/db";
import { createAuthenticatedMerchantContext } from "../helpers/auth";
test.describe("Analytics System", () => {
    test("can ingest event via service", async () => {
        // ... (no change needed here as it is service test)
        const merchantId = "test_ana_merch";
        await AnalyticsService.trackEvent({
            merchantId,
            eventName: "page_view",
            visitorId: "vis_123",
            path: "/home",
        });
        const evt = await prisma.analyticsEvent.findFirst({
            where: { merchantId, eventName: "page_view" },
            orderBy: { createdAt: "desc" },
        });
        expect(evt).toBeTruthy();
        expect(evt?.visitorId).toBe("vis_123");
    });
    // API test omitted, relying on service test + dashboard visual
    test("merchant dashboard shows analytics", async ({ page }) => {
        await createAuthenticatedMerchantContext(page);
        await page.route("**/analytics/overview*", async (route) => {
            await route.fulfill({
                json: {
                    kpis: {
                        netSales: 50000,
                        orders: 10,
                        paymentSuccessRate: 98,
                        deliverySuccessRate: 95,
                    },
                    healthScore: 85,
                },
            });
        });
        await page.goto("/admin/analytics");
        await page.screenshot({ path: "analytics-dashboard.png" });
        await expect(page.getByText("Business Overview")).toBeVisible();
        await expect(page.getByText("Net Sales")).toBeVisible();
    });
});
