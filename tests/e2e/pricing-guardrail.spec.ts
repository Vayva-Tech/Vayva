import { test, expect } from "@playwright/test";
import { checkPricingGuardrails } from "../helpers/contentChecks";

test.describe("Pricing Guardrails", () => {
  test("pricing page has correct NGN plans", async ({ page }) => {
    await page.goto("/pricing");
    await checkPricingGuardrails(page);
  });
});
