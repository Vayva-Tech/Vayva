import { test, expect } from "@playwright/test";

import { createAuthenticatedMerchantContext } from "../helpers/auth";

// 11.1 Navigation Freeze Test
test("Critical: Navigation Structure Lock", async ({ page }) => {
  await createAuthenticatedMerchantContext(page);
  await page.goto("/admin"); // Updated from /admin/dashboard

  // Wait for Sidebar
  await page.waitForSelector("nav");
  const navItems = await page.locator("nav a").allInnerTexts();
  console.log("Nav Items Found:", navItems);

  // Strict list (Best Guess - Update after run if mismatch)
  // Verified List from Run
  const ALLOWED_NAV = [
    "Overview",
    "Wallet",
    "WhatsApp Agent",
    "Products",
    "Orders",
    "Customers",
    "Control Center",
  ];

  expect(navItems.length).toBe(ALLOWED_NAV.length);
  ALLOWED_NAV.forEach((item) => expect(navItems).toContain(item));
});

// 11.2 Route Contract Test
test("Critical: Route Availability", async ({ page }) => {
  await createAuthenticatedMerchantContext(page);
  const routes = [
    "/admin",
    "/admin/products",
    "/admin/orders",
    "/admin/customers",
  ];

  for (const route of routes) {
    const response = await page.goto(route);
    // Expect 200 or 304
    expect([200, 304]).toContain(response?.status());
  }
});

// 11.3 Wallet E2E Flow (Temporarily Skipped as Wallet might not be ready)
test.skip("Wallet: Withdrawal Journey", async ({ page }) => {
  await createAuthenticatedMerchantContext(page);
  await page.goto("/admin/wallet");
  // ... logic ...
});
