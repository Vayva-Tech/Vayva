import { test, expect } from "@playwright/test";

/**
 * Visual Regression Tests for Header and Footer
 *
 * These tests ensure that the canonical header and footer
 * remain visually consistent across changes.
 */

test.describe("Header and Footer Consistency", () => {
  test("Header is visible and contains brand", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header).toContainText("Vayva");
  });

  test("Footer is visible and contains legal information", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Legal & Compliance");
    await expect(footer).toContainText("© 2025 Vayva Inc. Built for Africa.");
  });

  test("Header navigation links are present", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Features" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(header.getByRole("link", { name: "Templates" })).toBeVisible();
  });

  test("Auth CTAs are present in header", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(
      header.getByRole("link", { name: "Get Started" }),
    ).toBeVisible();
  });
});
