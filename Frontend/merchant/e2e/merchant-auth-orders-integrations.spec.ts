import { test, expect } from "@playwright/test";

/**
 * Deeper smoke: auth boundaries for dashboard, orders API, and a protected integration route.
 * No real OAuth or Paystack calls — asserts correct 401/redirect behavior without credentials.
 * Uses `request` where possible so CI/agents do not require a headed browser for API-only checks.
 */
test.describe("merchant auth, orders, integrations", () => {
  test("unauthenticated GET /dashboard redirects toward sign-in", async ({ request }) => {
    const res = await request.get("/dashboard", { maxRedirects: 0 });
    expect(res.status(), `expected redirect, got ${res.status()}`).toBeGreaterThanOrEqual(300);
    expect(res.status()).toBeLessThan(400);
    const headers = res.headers();
    const loc = headers["location"] || headers["Location"] || "";
    expect(loc).toMatch(/signin/i);
  });

  test("GET /api/orders without session returns 401", async ({ request }) => {
    const res = await request.get("/api/orders");
    expect(res.status()).toBe(401);
  });

  test("GET /api/socials/instagram/connect without session returns 401", async ({ request }) => {
    const res = await request.get("/api/socials/instagram/connect");
    expect(res.status()).toBe(401);
  });

  test("sign-in page HTML includes auth field test ids", async ({ request }) => {
    const res = await request.get("/signin");
    expect(res.ok()).toBeTruthy();
    const html = await res.text();
    expect(html).toContain('data-testid="auth-signin-email"');
    expect(html).toContain('data-testid="auth-signin-password"');
  });
});
