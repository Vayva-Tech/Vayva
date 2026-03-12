import { test, expect } from "@playwright/test";

// Constants for deterministic test user
const TEST_USER = {
  name: "Demo Merchant",
  email: "demo+e2e@vayva.test",
  password: "TestPass123!",
  otp: "123456",
  storeName: "Golden Path Store",
  storeSlug: "golden-path-store",
};

test.describe.skip("Golden Path: Merchant Journey", () => {
  test("Full Walkthrough: Landing -> Signup -> Onboarding -> Dashboard -> Signout", async ({
    page,
  }) => {
    // 1. Landing Page
    await page.goto("/");
    await expect(page).toHaveTitle(/Vayva/);
    await expect(page.getByTestId("landing-get-started")).toBeVisible();

    // Click Get Started
    await page.getByTestId("landing-get-started").click();
    await expect(page).toHaveURL(/\/signup/);

    // 2. Signup Flow
    // Fill details
    await page.getByLabel("First name").fill("Demo");
    await page.getByLabel("Last name").fill("Merchant");
    await page.getByLabel("Business name").fill(TEST_USER.storeName);

    await page.getByTestId("auth-signup-email").fill(TEST_USER.email);

    await page.getByTestId("auth-signup-password").fill(TEST_USER.password);
    await page.getByLabel("Confirm password").fill(TEST_USER.password);

    // Agree to terms (checkbox)
    await page.locator('input[type="checkbox"]').check();

    // Submit
    await page.getByTestId("auth-signup-submit").click();

    // 3. Verify Flow
    await expect(page).toHaveURL(/\/verify/, { timeout: 15000 }); // Wait for redirect

    // Check for mock OTP hint or just enter valid OTP
    // Our backdoor specific OTP is 123456 for e2e emails
    const otpInputContainer = page.getByTestId("auth-verify-otp-container");
    await expect(otpInputContainer).toBeVisible();

    // Simulate typing 123456
    await page
      .getByTestId("auth-verify-otp-container")
      .locator("input")
      .first()
      .click();
    await page.keyboard.type(TEST_USER.otp, { delay: 100 });

    // Wait for verify button enablement or auto submit
    await expect(page.getByTestId("auth-verify-submit")).toBeEnabled();
    await page.getByTestId("auth-verify-submit").click();

    // 4. Onboarding Flow
    // Expect redirection to /onboarding or /onboarding/welcome
    await expect(page).toHaveURL(/\/onboarding/);

    // Welcome Step
    await expect(page.getByText("Welcome")).toBeVisible();
    await page.getByTestId("onboarding-welcome-continue").click();

    // Check next step logic (Assuming Store Details)
    // Store Details Step
    await expect(page).toHaveURL(/\/onboarding\/store/);
    await page.getByTestId("onboarding-store-name").fill(TEST_USER.storeName);

    // Select Category
    await page.locator("select").first().selectOption("fashion");
    await page
      .getByPlaceholder("e.g. 12 Adetokunbo Ademola St")
      .fill("123 Test St");
    await page.getByPlaceholder("e.g. Victoria Island").fill("Lagos");
    // Save
    await page.getByTestId("onboarding-store-submit").click();

    // Branding Step -> Delivery -> Templates
    await expect(page).toHaveURL(/\/onboarding\/brand/);
    await page.getByText("Continue").click(); // Skip branding

    await expect(page).toHaveURL(/\/onboarding\/delivery/);
    await page.getByText("Continue").click(); // Skip delivery

    // Templates Step
    await expect(page).toHaveURL(/\/onboarding\/templates/);
    await page.getByTestId("onboarding-template-submit").click();

    // Products Step -> Skip
    await expect(page).toHaveURL(/\/onboarding\/products/);
    await page.getByText("Skip for now").click();

    // Review Step
    await expect(page).toHaveURL(/\/onboarding\/review/);
    await page.getByText("Launch My Store").click();

    // 5. Dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Check for greeting
    await expect(page.getByText(/Demo/)).toBeVisible();

    // Check Store Card
    await expect(page.getByTestId("dashboard-visit-store")).toBeVisible();

    // 6. Wallet Gating Check (KYC Pending)
    await page.goto("/admin/wallet");
    await expect(
      page.getByText("Identity Verification Required"),
    ).toBeVisible();

    // 7. Account & Signout
    // Open menu (Might need robust selector if ID changed)
    // Assuming AdminShell has data-testid="dashboard-avatar-menu" logic?
    // Code review showed Avatar but not TestId?
    // Code: <button onClick={() => setShowUserMenu(!showUserMenu)} ...>
    // Use generic selector if needed
    await page
      .locator("header button")
      .filter({ has: page.locator("svg") })
      .last()
      .click();

    // Wait for menu
    await expect(page.getByText("Sign out")).toBeVisible();
    await page.getByText("Sign out").click();

    // 8. Verify Redirect
    await expect(page).toHaveURL(/\/signin/);

    // Verify Session Cleared
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/signin/);
  });
});
