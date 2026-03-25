import { test, expect } from "@playwright/test";

/**
 * Fast smoke checks (no DB mutations). Use before deeper E2E or after deploy.
 * @see docs/03_development/e2e-merchant-smoke.md
 */
test.describe("@smoke merchant minimal", () => {
  test("GET /api/health returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok" });
  });

  test("sign-in page responds", async ({ page }) => {
    await page.goto("/signin");
    await expect(page).toHaveURL(/signin/);
  });
});
