import { test, expect } from "@playwright/test";
import { redactPhone, redactEmail, } from "../../apps/merchant-admin/src/lib/privacy/redact";
import { createAuthenticatedMerchantContext } from "../helpers/auth";
test.describe("Privacy Ops", () => {
    test.beforeEach(async ({ page }) => {
        await createAuthenticatedMerchantContext(page);
    });
    test("redact utils work correctly", () => {
        expect(redactPhone("+2348012345678")).toBe("+23****678");
        expect(redactEmail("john.doe@example.com")).toBe("jo***@example.com");
    });
    test("admin can trigger dsr export", async ({ page }) => {
        // Mock Export API
        await page.route("**/api/admin/privacy/dsr/export", async (route) => {
            const data = {
                customer: { id: "c1", name: "John Doe", email: "john@example.com" },
                orders: [],
            };
            await route.fulfill({
                contentType: "application/json",
                body: JSON.stringify(data),
            });
        });
        await page.goto("/admin/privacy");
        // Wait for page stable
        await expect(page.getByRole("heading", { name: /Privacy Operations/i })).toBeVisible();
        const storeInput = page.getByPlaceholder("e.g. store_123");
        await storeInput.waitFor();
        await storeInput.fill("store_1");
        const idInput = page.getByPlaceholder("Email or Phone");
        await idInput.fill("john@example.com");
        // Click Export
        const exportBtn = page.getByRole("button", { name: "Export Data (JSON)" });
        await exportBtn.click();
        await expect(page.getByText("Export downloaded")).toBeVisible();
    });
    test("admin can anonymize user with reason", async ({ page }) => {
        // Mock Anonymize API
        await page.route("**/api/admin/privacy/dsr/anonymize", async (route) => {
            await route.fulfill({ json: { success: true } });
        });
        await page.goto("/admin/privacy");
        await expect(page.getByRole("heading", { name: /Privacy Operations/i })).toBeVisible();
        await page.getByRole("button", { name: /Anonymize User/ }).click();
        // Check Modal
        await expect(page.getByText("Confirm Anonymization")).toBeVisible({
            timeout: 5000,
        });
        const reasonInput = page.getByPlaceholder(/DSR Ticket Number|Reason/);
        await reasonInput.waitFor();
        await reasonInput.fill("TICKET-1234");
        await page.getByRole("button", { name: "Confirm Anonymize" }).click();
        await expect(page.getByText("User Anonymized Successfully")).toBeVisible();
    });
});
