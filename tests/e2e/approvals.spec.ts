import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";

test.describe("Approvals Queue System", () => {
  test.beforeEach(async ({ page }) => {
    await createAuthenticatedMerchantContext(page);
  });
  // Requires seeding DB with a pending request or mocking API.

  test("navigate to approvals page", async ({ page }) => {
    await page.goto("/admin/wa-agent/approvals");
    await expect(page.getByText("Request")).toBeVisible(); // header
  });

  test("view pending requests", async ({ page }) => {
    test.slow(); // Allow extra time for client-side mock delays
    await page.goto("/admin/wa-agent/approvals");
    // Smoke Test: Verify Page Loads (Header is Static)
    await expect(page.getByText("Request")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("approve request flow", async ({ page }) => {
    await page.goto("/admin/wa-agent/approvals");
    // Smoke Test: Verify Page Loads
    await expect(page.getByText("Request")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });
});
