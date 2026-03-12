import { test, expect } from "@playwright/test";

test.describe("@ops Ops Permissions (Full)", () => {
  test("@ops unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/ops");
    await expect(page).toHaveURL(/\/ops\/login(\?|$)/);
  });

  test("@ops login rejects invalid credentials", async ({ request }) => {
    const res = await request.post("/api/ops/auth/login", {
      data: { email: "nope@vayva.test", password: "wrong" },
    });
    expect([400, 401]).toContain(res.status());
  });

  test("@ops can access ops area after login", async ({ page }) => {
    await page.goto("/ops/login");

    await page.getByLabel("Email address").fill("e2e-ops@vayva.test");
    await page.getByLabel("Password").fill("TestPass123!");
    await page.getByRole("button", { name: /Sign In|Login/i }).click();

    await expect(page).toHaveURL(/.*\/ops(\/|$)/, { timeout: 20000 });

    await page.goto("/ops/merchants");
    await expect(page).toHaveURL(/.*\/ops\/merchants(\/|$)/, { timeout: 20000 });
  });
});
