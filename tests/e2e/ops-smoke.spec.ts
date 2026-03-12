import { test, expect } from "@playwright/test";

const OPS_USER = { email: "e2e-ops@vayva.test", password: "TestPass123!" };

test.describe("Ops Smoke", () => {
  test("@smoke @ops Ops Console: Admin Login", async ({ page }) => {
    await page.goto("/ops/login");

    await page.getByPlaceholder("name@example.com").fill(OPS_USER.email);
    await page.getByPlaceholder("Password").fill(OPS_USER.password);
    await page.getByRole("button", { name: /Sign In|Login/i }).click();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.getByText(/Overview|Merchants/i).first()).toBeVisible();
  });

  test("@smoke @ops Ops API: health endpoint responds", async ({ request }) => {
    const res = await request.get("/api/ops/health");
    expect([200, 503]).toContain(res.status());
  });
});
