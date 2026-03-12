import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";
import { ReturnTokenService } from "../../apps/merchant-admin/src/lib/returns/returnToken";
test.describe("Returns Management", () => {
    test.beforeEach(async ({ page }) => {
        await createAuthenticatedMerchantContext(page);
    });
    test("can generate valid return token", () => {
        const token = ReturnTokenService.generate("ORD-123", "+2348000000000");
        expect(token).toContain(":");
        const decoded = ReturnTokenService.validate(token);
        expect(decoded).toEqual({
            orderId: "ORD-123",
            customerPhone: "+2348000000000",
        });
    });
    // API Test omitted as it requires running server
    test("merchant dashboard shows returns", async ({ page }) => {
        await page.goto("/admin/returns");
        await expect(page.getByText("Returns (RMA)")).toBeVisible();
        await expect(page.getByText("ORD-5521")).toBeVisible(); // Mock data
    });
});
