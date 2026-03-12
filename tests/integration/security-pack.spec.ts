import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  test("Strict Transport Security (HSTS)", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();

    expect(headers?.["strict-transport-security"]).toContain(
      "max-age=31536000",
    );
  });

  test("Content Security Policy (CSP)", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();

    expect(headers?.["content-security-policy"]).toBeTruthy();
    expect(headers?.["content-security-policy"]).toContain(
      "default-src 'self'",
    );
  });

  test("X-Frame-Options (Clickjack Protection)", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();

    expect(headers?.["x-frame-options"]).toBe("DENY");
  });
});
