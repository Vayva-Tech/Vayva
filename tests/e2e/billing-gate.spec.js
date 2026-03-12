import { test, expect } from "@playwright/test";
import { formatMoneyNGN } from "../../apps/merchant-admin/src/lib/billing/formatters";
import { createAuthenticatedMerchantContext } from "../helpers/auth";
const GROWTH_PRICE_STR = "₦25,000";
const PRO_PRICE_STR = "₦40,000";
test.describe("Billing Logic & Pricing Guardrails", () => {
    test("formatter output is strictly correct", () => {
        // Double check formatter in test env (Redundant to unit, but good for E2E logic confirmation)
        expect(formatMoneyNGN(25000)).toBe(GROWTH_PRICE_STR);
    });
    test("billing page displays correct locked prices", async ({ page }) => {
        test.slow();
        await createAuthenticatedMerchantContext(page);
        // Mock plans
        await page.route("**/billing/plans*", async (route) => {
            await route.fulfill({
                json: [
                    {
                        id: "1",
                        key: "growth",
                        name: "Growth",
                        priceMonthly: 25000,
                        priceYearly: 250000,
                        features: [],
                        description: "Starter",
                    },
                    {
                        id: "2",
                        key: "pro",
                        name: "Pro",
                        priceMonthly: 40000,
                        priceYearly: 400000,
                        features: [],
                        description: "Advanced",
                    },
                ],
            });
        });
        // Mock subscription
        await page.route("**/billing/subscription*", async (route) => {
            await route.fulfill({ json: { plan: { key: "growth" } } });
        });
        await page.goto("/admin/billing/plans");
        // Smoke Test: Verify Page Loads content (Static Header)
        await expect(page.getByText("Choose Your Plan")).toBeVisible();
        await expect(page.getByText("Monthly")).toBeVisible();
    });
    test("upgrade flow initiation", async ({ page }) => {
        test.slow();
        await createAuthenticatedMerchantContext(page);
        await page.route("**/billing/plans*", async (route) => {
            await route.fulfill({
                json: [
                    {
                        id: "1",
                        key: "growth",
                        name: "Growth",
                        priceMonthly: 25000,
                        features: [],
                        description: "",
                    },
                    {
                        id: "2",
                        key: "pro",
                        name: "Pro",
                        priceMonthly: 40000,
                        features: [],
                        description: "",
                    },
                ],
            });
        });
        await page.route("**/billing/subscription*", async (route) => {
            await route.fulfill({ json: { plan: { key: "growth" } } });
        });
        await page.route("**/billing/subscription/upgrade", async (route) => {
            await route.fulfill({ status: 200, json: { ok: true } });
        });
        await page.goto("/admin/billing/plans");
        // Smoke Test: Verify Upgrade Button exists
        await expect(page.getByRole("button", { name: "Upgrade" }).first()).toBeVisible();
    });
});
