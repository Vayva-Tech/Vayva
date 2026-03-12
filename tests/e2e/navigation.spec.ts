import { test, expect } from "@playwright/test";

const ROUTES = {
  home: "/",
  templates: "/templates",
  pricing: "/pricing",
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  signup: "/signup",
  signin: "/signin",
} as const;

test.describe("Site-Wide Navigation", () => {
  test("should navigate via global header", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");

    // Check for Templates link
    await expect(header.getByRole("link", { name: "Templates" })).toBeVisible();
    await header.getByRole("link", { name: "Templates" }).click();
    await expect(page).toHaveURL(/\/templates/);

    await page.goto("/");
    // Check for Pricing link
    await expect(header.getByRole("link", { name: "Pricing" })).toBeVisible();
    await header.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("should verify Header CTAs", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");

    const loginLink = header.getByRole("link", { name: "Login" });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute("href", ROUTES.signin);

    const getStartedLink = header.getByRole("link", { name: "Get Started" });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute("href", ROUTES.signup);
  });

  test("should verify Footer Links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");

    // Static smoke test of footer headers
    await expect(footer.getByText("Product", { exact: true })).toBeVisible();
    await expect(footer.getByText("Company", { exact: true })).toBeVisible();
    await expect(
      footer.getByText("Legal & Compliance", { exact: true }),
    ).toBeVisible();
  });

  test("should verify Landing Page CTAs", async ({ page }) => {
    await page.goto("/");

    // Hero CTA
    const heroGetStarted = page
      .getByRole("link", { name: "Get Started" })
      .first();
    await expect(heroGetStarted).toBeVisible();
    await expect(heroGetStarted).toHaveAttribute("href", ROUTES.signup);
  });
});
