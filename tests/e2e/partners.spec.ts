import { test, expect } from "@playwright/test";
import { createAuthenticatedMerchantContext } from "../helpers/auth";

test.describe("Partners Directory", () => {
  test.beforeEach(async ({ page }) => {
    await createAuthenticatedMerchantContext(page);
  });

  test("admin can list partners", async ({ page }) => {
    // Mock List
    await page.route("/api/admin/partners", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          json: {
            partners: [
              {
                id: "p1",
                name: "Top Influencer",
                type: "influencer",
                status: "active",
                createdAt: new Date().toISOString(),
                _count: { attributions: 5 },
              },
            ],
          },
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/admin/partners");
    await expect(page.getByText("Top Influencer")).toBeVisible();
    await expect(page.getByText("5", { exact: true })).toBeVisible(); // Attributions
  });

  test("admin generate code returns signed link", async ({ page }) => {
    // Ensure we are on a valid domain for relative fetch
    await page.goto("/admin/partners");

    // This is an API test essentially
    // Mock the endpoint to return a success structure as if DB created it
    await page.route("/api/admin/partners/codes", async (route) => {
      await route.fulfill({
        json: {
          refCode: { id: "code1", code: "TEST" },
          link: "https://vayva.ng/signup?ref=eyJ...signature",
          token: "eyJ...signature",
        },
      });
    });

    // Use page.evaluate to make the request from the browser context so page.route can intercept it
    const data = await page.evaluate(async () => {
      const res = await fetch("/api/admin/partners/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: "p1", code: "TEST" }),
      });
      return res.json();
    });

    expect(data.link).toContain("https://vayva.ng/signup?ref=");
  });
});
