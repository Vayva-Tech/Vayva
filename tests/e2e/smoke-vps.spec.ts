import { test, expect } from '@playwright/test';

const VPS_URL = 'http://163.245.209.202:3000';

test.describe('VPS Smoke Tests', () => {
  test('health check passes', async ({ request }) => {
    const response = await request.get(`${VPS_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('signin page loads', async ({ page }) => {
    await page.goto(`${VPS_URL}/signin`);
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto(`${VPS_URL}/signup`);
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });
});
