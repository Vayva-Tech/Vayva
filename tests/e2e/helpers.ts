// Helper function to log API errors in tests
export async function expectApiSuccess(response: Response, testName: string) {
  if (!response.ok()) {
    const body = await response.text();
    console.error(
      `[${testName}] API Error: ${(response as any).status()} ${(response as any).statusText()}`,
    );
    console.error(`[${testName}] Response body:`, body);
    console.error(`[${testName}] Request URL:`, response.url);
  }
  expect(response.ok()).toBeTruthy();
}

import { Page, expect } from "@playwright/test";

/**
 * Login as a specific role for testing
 * Uses test credentials based on role
 */
export async function loginAsRole(page: Page, role: string) {
  // Navigate to login page
  await page.goto("/auth/login");
  
  // Fill in test credentials based on role
  const testEmails: Record<string, string> = {
    owner: "owner@test.com",
    admin: "admin@test.com",
    manager: "manager@test.com",
    staff: "staff@test.com",
    accountant: "accountant@test.com",
    support: "support@test.com",
  };
  
  await page.getByLabel(/email/i).fill(testEmails[role] || "admin@test.com");
  await page.getByLabel(/password/i).fill("testpassword123");
  
  // Submit login form
  await page.getByRole("button", { name: /sign in/i }).click();
  
  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard/);
  
  // Verify we're logged in
  await expect(page.getByText(/dashboard/i).first()).toBeVisible();
}
