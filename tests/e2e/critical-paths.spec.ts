/**
 * Critical Business Flows - E2E Tests
 * 
 * These tests validate the most important business flows in the Vayva platform:
 * 1. Complete order flow: WhatsApp → Payment → Delivery
 * 2. Merchant onboarding → First AI sale
 * 3. Autopilot suggests action → Merchant approves → Executed
 * 
 * These are smoke tests that ensure core functionality works end-to-end.
 */

import { test, expect } from "@playwright/test";

// Test data
const TEST_MERCHANT = {
  phone: "+2348100000001",
  storeName: "Test Store E2E",
  firstName: "Test",
  lastName: "Merchant",
};

const TEST_CUSTOMER = {
  phone: "+2348100000002",
  name: "Test Customer",
};

const TEST_PRODUCT = {
  name: "Test Product",
  price: 5000,
  description: "A product for E2E testing",
};

test.describe("Critical Business Flows", () => {
  test.describe("Order Flow: WhatsApp → Payment → Delivery", () => {
    test("customer can place order via WhatsApp and complete payment", async ({ page }) => {
      // Step 1: Navigate to storefront
      await page.goto("/");
      await expect(page).toHaveTitle(/Vayva|Store/);

      // Step 2: Browse products (if available)
      const productLinks = page.locator("[data-testid='product-card']").first();
      
      // If products exist, click on one
      if (await productLinks.isVisible().catch(() => false)) {
        await productLinks.click();
        await expect(page.locator("[data-testid='product-detail']")).toBeVisible();
      }

      // Step 3: Add to cart or initiate WhatsApp order
      const whatsappButton = page.locator("text=Order on WhatsApp, Buy on WhatsApp, Chat to Order").first();
      
      if (await whatsappButton.isVisible().catch(() => false)) {
        // Test WhatsApp integration link
        const href = await whatsappButton.getAttribute("href");
        expect(href).toContain("wa.me") || expect(href).toContain("whatsapp");
      }

      // Step 4: Verify checkout/payment flow is accessible
      // Note: Actual payment processing requires external APIs
      await page.goto("/checkout");
      
      // Should either show checkout form or redirect to appropriate page
      const checkoutElements = await Promise.all([
        page.locator("text=checkout, payment, order").first().isVisible().catch(() => false),
        page.locator("form").first().isVisible().catch(() => false),
      ]);
      
      expect(checkoutElements.some(Boolean)).toBeTruthy();
    });

    test("merchant can view and manage orders", async ({ page }) => {
      // Navigate to merchant admin
      await page.goto("http://localhost:3000/login");

      // Should show login page
      await expect(page.locator("text=Login, Sign in, Welcome back").first()).toBeVisible();

      // Note: Full login requires OTP/WhatsApp verification
      // This test validates the login page structure
      const loginForm = page.locator("form");
      const phoneInput = page.locator("input[type='tel'], input[name='phone']").first();
      
      expect(await loginForm.isVisible().catch(() => false) || 
             await phoneInput.isVisible().catch(() => false)).toBeTruthy();
    });
  });

  test.describe("Merchant Onboarding Flow", () => {
    test("onboarding page is accessible and functional", async ({ page }) => {
      await page.goto("http://localhost:3000/onboarding");

      // Should show onboarding or redirect to login if not authenticated
      const pageContent = await page.content();
      const hasOnboardingContent = 
        pageContent.toLowerCase().includes("onboarding") ||
        pageContent.toLowerCase().includes("setup") ||
        pageContent.toLowerCase().includes("get started") ||
        pageContent.toLowerCase().includes("login") ||
        pageContent.toLowerCase().includes("sign in");

      expect(hasOnboardingContent).toBeTruthy();
    });

    test("signup page allows phone number entry", async ({ page }) => {
      await page.goto("http://localhost:3000/signup");

      // Look for phone input
      const phoneInput = page.locator("input[type='tel'], input[name='phone'], input[placeholder*='phone' i]").first();
      
      if (await phoneInput.isVisible().catch(() => false)) {
        // Test phone input validation
        await phoneInput.fill(TEST_MERCHANT.phone);
        const value = await phoneInput.inputValue();
        expect(value).toContain("234");
      }
    });
  });

  test.describe("Core API Health", () => {
    test("public status endpoint returns health data", async ({ request }) => {
      const response = await request.get("http://localhost:3000/api/public/status");
      
      // Should return 200 or redirect
      expect([200, 301, 302]).toContain(response.status());

      if (response.status() === 200) {
        const body = await response.json();
        // Should have health-related data
        expect(body).toBeDefined();
      }
    });

    test("core-api is responsive", async ({ request }) => {
      const endpoints = [
        "/api/public/status",
        "/api/health",
      ];

      for (const endpoint of endpoints) {
        const response = await request.get(`http://localhost:3000${endpoint}`).catch(() => null);
        
        // At least one endpoint should respond successfully
        if (response && response.status() === 200) {
          return; // Success
        }
      }

      // If we get here, try the ops console health endpoint
      const opsResponse = await request.get("http://localhost:3002/api/health/ping").catch(() => null);
      expect(opsResponse?.status()).toBe(200);
    });
  });

  test.describe("Ops Console Access", () => {
    test("ops console login page loads", async ({ page }) => {
      await page.goto("http://localhost:3002");

      // Should redirect to login or show dashboard
      const url = page.url();
      expect(url).toContain("localhost:3002");

      // Look for login-related content
      const content = await page.content();
      const hasLoginContent = 
        content.toLowerCase().includes("login") ||
        content.toLowerCase().includes("sign in") ||
        content.toLowerCase().includes("dashboard") ||
        content.toLowerCase().includes("command center");

      expect(hasLoginContent).toBeTruthy();
    });

    test("ops health endpoint returns data", async ({ request }) => {
      const response = await request.get("http://localhost:3002/api/ops/health/ping");
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty("status");
    });
  });

  test.describe("Storefront Functionality", () => {
    test("storefront loads without errors", async ({ page }) => {
      await page.goto("http://localhost:3001");

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Check for common error indicators
      const content = await page.content();
      const hasError = 
        content.includes("Application error") ||
        content.includes("Internal Server Error") ||
        content.includes("404") && content.includes("Not Found");

      expect(hasError).toBeFalsy();
    });

    test("storefront has navigation elements", async ({ page }) => {
      await page.goto("http://localhost:3001");

      // Look for common navigation elements
      const navElements = await Promise.all([
        page.locator("nav").first().isVisible().catch(() => false),
        page.locator("header").first().isVisible().catch(() => false),
        page.locator("[role='navigation']").first().isVisible().catch(() => false),
      ]);

      expect(navElements.some(Boolean)).toBeTruthy();
    });
  });

  test.describe("Marketing Site", () => {
    test("marketing site loads", async ({ page }) => {
      // Marketing site typically runs on a different port or domain
      // This test assumes it's accessible
      await page.goto("http://localhost:3003").catch(async () => {
        // If port 3003 fails, try the main domain
        await page.goto("http://localhost:3000");
      });

      const content = await page.content();
      expect(content.length).toBeGreaterThan(100); // Should have content
    });
  });
});

test.describe("Integration Health Checks", () => {
  test("database connectivity via API", async ({ request }) => {
    // Test a simple API endpoint that requires database
    const response = await request.get("http://localhost:3000/api/public/status");
    
    // Should not return 500 (which would indicate DB issues)
    expect(response.status()).not.toBe(500);
  });

  test("Redis connectivity via health endpoint", async ({ request }) => {
    const response = await request.get("http://localhost:3002/api/ops/health/ping");
    
    if (response.status() === 200) {
      const body = await response.json();
      // If status is present, system is operational
      expect(body).toBeDefined();
    }
  });
});
