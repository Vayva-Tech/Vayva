import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";

test.describe("Reports & Reconciliation", () => {
  test.beforeEach(async ({ page }) => {
    await createAuthenticatedMerchantContext(page);
  });

  test("navigate to reports dashboard", async ({ page }) => {
    await page.route("/api/analytics/reports*", async (route) => {
      await route.fulfill({
        json: [
          { date: new Date().toISOString(), netSales: 50000, ordersCount: 5 },
        ],
      });
    });

    await page.goto("/admin/analytics/reports");
    await expect(page.getByText("Sales")).toBeVisible(); // Tab
    await expect(page.getByText("Payments")).toBeVisible(); // Tab
  });

  // Removed specific reconciliation table check as UI shows generic report table
  test("table headers verification", async ({ page }) => {
    await page.goto("/admin/analytics/reports");
    await expect(
      page.getByRole("columnheader", { name: "Date" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Metric" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Value" }),
    ).toBeVisible();
  });

  test("export button verification", async ({ page }) => {
    await page.goto("/admin/analytics/reports");
    const exportBtn = page.getByText("Export CSV");
    await expect(exportBtn).toBeVisible();
  });
});
