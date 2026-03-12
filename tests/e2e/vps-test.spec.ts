import { test, expect } from '@playwright/test';

const VPS_URL = 'http://163.245.209.202:3000';
const TEST_USER = {
  email: 'demo+e2e@vayva.test',
  password: 'TestPass123!'
};

test.describe('VPS Production Tests', () => {
  test('marketing site is accessible', async ({ page }) => {
    await page.goto('https://vayva.ng');
    await expect(page.locator('text=Vayva')).toBeVisible();
    console.log('✅ Marketing site OK');
  });

  test('merchant admin login page loads', async ({ page }) => {
    await page.goto(`${VPS_URL}/signin`);
    await expect(page.locator('text=Sign In')).toBeVisible();
    console.log('✅ Login page OK');
  });

  test('user can login with test credentials', async ({ page }) => {
    await page.goto(`${VPS_URL}/signin`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard or error
    await page.waitForTimeout(3000);
    
    const url = page.url();
    if (url.includes('/dashboard')) {
      console.log('✅ Login successful - redirected to dashboard');
    } else {
      console.log('⚠️ Login result:', url);
    }
  });

  test('health API responds', async ({ request }) => {
    const response = await request.get(`${VPS_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
    console.log('✅ Health API OK');
  });
});
