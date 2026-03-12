import { test, expect } from '@playwright/test';

test.describe('VPS Production Login', () => {
  test('test user can login on VPS', async ({ page }) => {
    // Navigate to VPS login page
    await page.goto('http://163.245.209.202:3000/signin');
    
    // Fill in credentials
    await page.fill('input[name="email"]', 'demo+e2e@vayva.test');
    await page.fill('input[name="password"]', 'TestPass123!');
    
    // Click sign in
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify dashboard loaded
    await expect(page.locator('text=Dashboard')).toBeVisible();
    console.log('✅ Login successful on VPS');
  });

  test('dashboard pages are accessible', async ({ page }) => {
    // Login first
    await page.goto('http://163.245.209.202:3000/signin');
    await page.fill('input[name="email"]', 'demo+e2e@vayva.test');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Test products page
    await page.goto('http://163.245.209.202:3000/products');
    await expect(page.locator('text=Products')).toBeVisible();
    console.log('✅ Products page accessible');
    
    // Test orders page
    await page.goto('http://163.245.209.202:3000/orders');
    await expect(page.locator('text=Orders')).toBeVisible();
    console.log('✅ Orders page accessible');
    
    // Test inventory page
    await page.goto('http://163.245.209.202:3000/inventory');
    await expect(page.locator('text=Inventory')).toBeVisible();
    console.log('✅ Inventory page accessible');
  });
});
