import { test, expect } from '@playwright/test';
// Credentials (assuming standard seed/dev entries)
const OPS_USER = { email: "admin@vayva.com", password: "password" };
const MERCHANT_USER = { email: "demo@vayva.ng", password: "password" };
test.describe('Vayva Smoke Tests', () => {
    // 1. Ops Console Login
    test('Ops Console: Admin Login', async ({ page }) => {
        await page.goto('http://localhost:3002/login');
        // Fill login form
        await page.getByPlaceholder('name@example.com').fill(OPS_USER.email);
        await page.getByPlaceholder('Password').fill(OPS_USER.password);
        await page.getByRole('button', { name: /Sign In|Login/i }).click();
        // Verify Dashboard access
        // Adjusted for likely MFA or direct access
        // If MFA is required, this test might fail without seed bypass.
        // Assuming dev env disables MFA or uses simple flow.
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.getByText(/Overview|Merchants/i).first()).toBeVisible();
    });
    // 2. Merchant Admin Login & Product Create
    test('Merchant Admin: Login & Create Product', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.getByLabel('Email').fill(MERCHANT_USER.email);
        await page.getByLabel('Password').fill(MERCHANT_USER.password);
        await page.getByRole('button', { name: /Sign In|Login/i }).click();
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.getByText(/Orders|Products/i).first()).toBeVisible();
        // Create Product
        await page.getByRole('link', { name: /Products/i }).click();
        await page.getByRole('button', { name: /Add Product|New Product/i }).click();
        const productName = `Smoke Product ${Date.now()}`;
        await page.getByLabel('Name').fill(productName);
        await page.getByLabel('Price').fill('1000');
        // Assuming simple form for MVP
        await page.getByRole('button', { name: /Save|Create/i }).click();
        // Verify it appears in list
        await expect(page.getByText(productName)).toBeVisible();
    });
    // 3. Permission Isolation
    test('Security: Merchant cannot access Ops isolation', async ({ page }) => {
        // Attempt to log in to Ops Console with Merchant Creds
        await page.goto('http://localhost:3002/login');
        await page.getByPlaceholder('name@example.com').fill(MERCHANT_USER.email);
        await page.getByPlaceholder('Password').fill(MERCHANT_USER.password);
        await page.getByRole('button', { name: /Sign In|Login/i }).click();
        // Should NOT go to dashboard. Should show error or stay on login.
        await expect(page).not.toHaveURL(/.*dashboard/);
        // Optionally check for error message
    });
    // 4. Broken Route Check
    test('Security: Merchant Admin has no legacy /admin routes', async ({ page }) => {
        await page.goto('http://localhost:3000/admin');
        // Next.js 404 page usually contains "404"
        await expect(page.getByText('404')).toBeVisible();
    });
});
