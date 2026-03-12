import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/signin");
    await expect(
      page.getByRole("heading", { name: /Welcome back/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: /Create your Vayva account/i }),
    ).toBeVisible();
  });

  test("protected route redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/.*signin.*/); // Changed from login to signin
  });
});
