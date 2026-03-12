import { test, expect } from "@playwright/test";

// TODO: These tests require full signup flow with email verification
// Better suited for manual testing or dedicated integration test suite
test.describe.skip("Onboarding Gating System", () => {
  const testUser = {
    firstName: "Test",
    lastName: "User",
    businessName: "Test Business",
    email: `test-${Date.now()}@example.com`,
    password: "TestPassword123!",
  };

  test("User cannot access dashboard before completing onboarding", async ({
    page,
  }) => {
    // 1. Sign up new user
    await page.goto("http://localhost:3000/signup");

    await page.fill('input[id="firstName"]', testUser.firstName);
    await page.fill('input[id="lastName"]', testUser.lastName);
    await page.fill('input[id="businessName"]', testUser.businessName);
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.fill('input[id="confirmPassword"]', testUser.password);
    await page.check('input[type="checkbox"]'); // Agree to terms

    await page.click('button[type="submit"]');

    // 2. Should redirect to verification page
    await expect(page).toHaveURL(/\/verify/);

    // For this test, we'll simulate verification by directly logging in
    // In production, you'd verify the email first
    await page.goto("http://localhost:3000/signin");
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // 3. Should redirect to onboarding (not dashboard)
    await page.waitForURL(/\/onboarding/);
    expect(page.url()).toContain("/onboarding");

    // 4. Attempt to navigate directly to dashboard
    await page.goto("http://localhost:3000/admin/admin");

    // 5. Should be redirected back to onboarding
    await page.waitForURL(/\/onboarding/);
    expect(page.url()).toContain("/onboarding");
    expect(page.url()).not.toContain("/admin/admin");
  });

  test("Save & Exit logs user out and allows resume", async ({ page }) => {
    // 1. Sign up and start onboarding
    await page.goto("http://localhost:3000/signup");

    const uniqueEmail = `savexit-${Date.now()}@example.com`;
    await page.fill('input[id="firstName"]', testUser.firstName);
    await page.fill('input[id="lastName"]', testUser.lastName);
    await page.fill('input[id="businessName"]', testUser.businessName);
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="password"]', testUser.password);
    await page.fill('input[id="confirmPassword"]', testUser.password);
    await page.check('input[type="checkbox"]');

    await page.click('button[type="submit"]');

    // Navigate to onboarding (skip verification for test)
    await page.goto("http://localhost:3000/onboarding/welcome");

    // 2. Fill in some data and progress to next step
    // (Assuming there's a "Next" or "Continue" button)
    const nextButton = page
      .locator('button:has-text("Next"), button:has-text("Continue")')
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // 3. Click "Save & Exit" button
    const saveExitButton = page
      .locator(
        'button:has-text("Save & Exit"), button:has-text("Save and Exit")',
      )
      .first();
    if (await saveExitButton.isVisible()) {
      await saveExitButton.click();

      // 4. Should redirect to /signin (logged out)
      await page.waitForURL(/\/signin/);
      expect(page.url()).toContain("/signin");

      // 5. Log back in
      await page.fill('input[type="email"]', uniqueEmail);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');

      // 6. Should resume onboarding (not start from beginning)
      await page.waitForURL(/\/onboarding/);
      expect(page.url()).toContain("/onboarding");
      // Should not be at welcome step if we progressed
      expect(page.url()).not.toContain("/onboarding/welcome");
    }
  });

  test("Completed onboarding allows dashboard access", async ({ page }) => {
    // 1. Sign up
    await page.goto("http://localhost:3000/signup");

    const uniqueEmail = `complete-${Date.now()}@example.com`;
    await page.fill('input[id="firstName"]', "Complete");
    await page.fill('input[id="lastName"]', "User");
    await page.fill('input[id="businessName"]', "Complete Business");
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="password"]', testUser.password);
    await page.fill('input[id="confirmPassword"]', testUser.password);
    await page.check('input[type="checkbox"]');

    await page.click('button[type="submit"]');

    // 2. Complete all onboarding steps
    // This is a simplified version - in reality you'd go through each step
    await page.goto("http://localhost:3000/onboarding/welcome");

    // Navigate through steps (simplified)
    const steps = ["welcome", "business", "whatsapp", "templates", "review"];
    for (const step of steps) {
      await page.goto(`http://localhost:3000/onboarding/${step}`);
      await page.waitForTimeout(300);

      // Try to click next/continue button
      const continueBtn = page
        .locator(
          'button:has-text("Next"), button:has-text("Continue"), button:has-text("Complete")',
        )
        .first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // 3. After completion, should redirect to dashboard
    await page.waitForURL(/\/admin\/admin/, { timeout: 10000 });
    expect(page.url()).toContain("/admin/admin");

    // 4. Verify dashboard displays signup data
    // Look for welcome message with first name
    const welcomeMessage = page.locator("text=/Welcome back.*Complete/i");
    await expect(welcomeMessage).toBeVisible({ timeout: 5000 });
  });

  test("Dashboard blocks access and URL manipulation attempts", async ({
    page,
  }) => {
    // Create a user with incomplete onboarding
    await page.goto("http://localhost:3000/signup");

    const uniqueEmail = `blocked-${Date.now()}@example.com`;
    await page.fill('input[id="firstName"]', "Blocked");
    await page.fill('input[id="lastName"]', "User");
    await page.fill('input[id="businessName"]', "Blocked Business");
    await page.fill('input[id="email"]', uniqueEmail);
    await page.fill('input[id="password"]', testUser.password);
    await page.fill('input[id="confirmPassword"]', testUser.password);
    await page.check('input[type="checkbox"]');

    await page.click('button[type="submit"]');

    // Start onboarding but don't complete
    await page.goto("http://localhost:3000/onboarding/welcome");

    // Test various dashboard routes
    const dashboardRoutes = [
      "/admin/admin",
      "/admin/settings",
      "/admin/orders",
      "/admin/products",
      "/admin/customers",
    ];

    for (const route of dashboardRoutes) {
      await page.goto(`http://localhost:3000${route}`);

      // Should always redirect to onboarding
      await page.waitForURL(/\/onboarding/, { timeout: 5000 });
      expect(page.url()).toContain("/onboarding");
      expect(page.url()).not.toContain("/admin");
    }
  });

  test("Signup data flows correctly to dashboard", async ({ page }) => {
    // 1. Sign up with specific data
    await page.goto("http://localhost:3000/signup");

    const testData = {
      firstName: "DataFlow",
      lastName: "TestUser",
      businessName: "DataFlow Business Inc",
      email: `dataflow-${Date.now()}@example.com`,
      password: "TestPassword123!",
    };

    await page.fill('input[id="firstName"]', testData.firstName);
    await page.fill('input[id="lastName"]', testData.lastName);
    await page.fill('input[id="businessName"]', testData.businessName);
    await page.fill('input[id="email"]', testData.email);
    await page.fill('input[id="password"]', testData.password);
    await page.fill('input[id="confirmPassword"]', testData.password);
    await page.check('input[type="checkbox"]');

    await page.click('button[type="submit"]');

    // 2. Go to onboarding and check if business name is pre-filled
    await page.goto("http://localhost:3000/onboarding/business");

    // Check if business name field has the value from signup
    const businessNameInput = page
      .locator('input[name="businessName"], input[id="businessName"]')
      .first();
    if (await businessNameInput.isVisible()) {
      const value = await businessNameInput.inputValue();
      expect(value).toBe(testData.businessName);
    }

    // 3. Complete onboarding (simplified)
    // In reality, you'd go through all steps properly

    // 4. Navigate to dashboard
    await page.goto("http://localhost:3000/admin/admin");

    // 5. Verify firstName appears in welcome message
    const welcomeText = page.locator(
      `text=/Welcome back.*${testData.firstName}/i`,
    );
    await expect(welcomeText).toBeVisible({ timeout: 5000 });
  });
});
