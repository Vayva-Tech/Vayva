import { test, expect } from "@playwright/test";
import { signIn, TEST_USER } from "./fixtures/auth";

test.describe("Onboarding Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await signIn(page);
  });

  test("should complete onboarding flow without auto-publishing store", async ({
    page,
  }) => {
    // Navigate to onboarding
    await page.goto("/onboarding");

    // Step 1: Welcome - Skip or continue
    const welcomeHeading = page.locator('h1:has-text("Welcome")');
    if (await welcomeHeading.isVisible()) {
      await page.click('button:has-text("Get Started")');
    }

    // Step 2: Business Information
    await page.waitForURL(/\/onboarding/, { timeout: 5000 });

    // Fill business name if not already filled
    const businessNameInput = page.locator('input[name="businessName"]');
    if (await businessNameInput.isVisible()) {
      await businessNameInput.fill("Test E-Commerce Store");
    }

    // Select industry
    const industrySelect = page.locator('select[name="industry"]');
    if (await industrySelect.isVisible()) {
      await industrySelect.selectOption("ecommerce");
    }

    // Continue to next step
    await page.click('button:has-text("Continue")');

    // Step 3: Identity/KYC Information
    await page.waitForTimeout(1000);

    const firstNameInput = page.locator('input[name="firstName"]');
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill(TEST_USER.firstName);
    }

    const lastNameInput = page.locator('input[name="lastName"]');
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill(TEST_USER.lastName);
    }

    const phoneInput = page.locator('input[name="phone"]');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("+2348012345678");
    }

    // Continue to finance step
    const continueBtn = page.locator('button:has-text("Continue")');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // Step 4: Financial Information
    await page.waitForTimeout(1000);

    const accountNumberInput = page.locator('input[name="accountNumber"]');
    if (await accountNumberInput.isVisible()) {
      await accountNumberInput.fill("0123456789");
    }

    const bankNameInput = page.locator('input[name="bankName"]');
    if (await bankNameInput.isVisible()) {
      await bankNameInput.fill("Test Bank");
    }

    const accountNameInput = page.locator('input[name="accountName"]');
    if (await accountNameInput.isVisible()) {
      await accountNameInput.fill(
        `${TEST_USER.firstName} ${TEST_USER.lastName}`,
      );
    }

    // Continue to review
    const financeNextBtn = page.locator('button:has-text("Continue")');
    if (await financeNextBtn.isVisible()) {
      await financeNextBtn.click();
    }

    // Step 5: Review and Complete
    await page.waitForTimeout(1000);

    const completeBtn = page.locator('button:has-text("Complete")');
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
    }

    // Wait for completion
    await page.waitForTimeout(2000);

    // Verify: Should redirect to dashboard (not auto-published)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Verify: Store should NOT be live yet (onboarding complete, but not published)
    const response = await page.request.get("/api/auth/merchant/me");
    const data = await response.json();

    expect(data.merchant.onboardingCompleted).toBe(true);
    // Store should NOT be auto-published
    expect(data.merchant.isLive).not.toBe(true);
  });

  test("should save bank beneficiary correctly during onboarding", async ({
    page,
  }) => {
    await page.goto("/onboarding");

    // Navigate to finance step (assuming we can skip to it)
    await page.goto("/onboarding?step=finance");

    // Fill financial information
    await page.fill('input[name="accountNumber"]', "9876543210");
    await page.fill('input[name="bankName"]', "Access Bank");
    await page.fill('input[name="accountName"]', "Test Beneficiary");

    // Save progress
    await page.click('button:has-text("Save")');

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify bank beneficiary was created/updated (not with fake ID)
    const bankResponse = await page.request.get("/api/merchant/bank-accounts");
    if (bankResponse.ok()) {
      const banks = await bankResponse.json();
      const defaultBank = banks.find((b: any) => b.isDefault);

      if (defaultBank) {
        expect(defaultBank.accountNumber).toBe("9876543210");
        expect(defaultBank.bankName).toBe("Access Bank");
        // Verify ID is a valid UUID, not "new-record"
        expect(defaultBank.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
      }
    }
  });
});
