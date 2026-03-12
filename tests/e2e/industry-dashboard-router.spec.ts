/**
 * Integration tests for Industry Dashboard Router
 * Tests that the router correctly loads industry-specific dashboards
 */

import { test, expect } from '@playwright/test';

test.describe('Industry Dashboard Router', () => {
  test.beforeEach(async ({ page }) => {
    // Login as merchant before each test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'merchant@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should load Events dashboard for events industry', async ({ page }) => {
    // Navigate to a store with events industry
    await page.goto('/dashboard?industry=events');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="events-dashboard"]', { timeout: 10000 });
    
    // Verify Events-specific elements are present
    await expect(page.locator('[data-testid="timeline-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="vendors-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="guests-section"]')).toBeVisible();
  });

  test('should load Automotive dashboard for automotive industry', async ({ page }) => {
    await page.goto('/dashboard?industry=automotive');
    await page.waitForSelector('[data-testid="automotive-dashboard"]', { timeout: 10000 });
    
    // Verify Automotive-specific elements
    await expect(page.locator('[data-testid="inventory-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="service-scheduler-section"]')).toBeVisible();
  });

  test('should load Grocery dashboard for grocery industry', async ({ page }) => {
    await page.goto('/dashboard?industry=grocery');
    await page.waitForSelector('[data-testid="grocery-dashboard"]', { timeout: 10000 });
    
    // Verify Grocery-specific elements
    await expect(page.locator('[data-testid="freshness-tracking"]')).toBeVisible();
    await expect(page.locator('[data-testid="inventory-management"]')).toBeVisible();
  });

  test('should load Wholesale dashboard for wholesale industry', async ({ page }) => {
    await page.goto('/dashboard?industry=wholesale');
    await page.waitForSelector('[data-testid="wholesale-dashboard"]', { timeout: 10000 });
    
    // Verify Wholesale-specific elements
    await expect(page.locator('[data-testid="bulk-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="distribution-network"]')).toBeVisible();
  });

  test('should load Nightlife dashboard for nightlife industry', async ({ page }) => {
    await page.goto('/dashboard?industry=nightlife');
    await page.waitForSelector('[data-testid="nightlife-dashboard"]', { timeout: 10000 });
    
    // Verify Nightlife-specific elements
    await expect(page.locator('[data-testid="promoter-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-reservations"]')).toBeVisible();
    await expect(page.locator('[data-testid="bottle-service"]')).toBeVisible();
  });

  test('should load Nonprofit dashboard for nonprofit industry', async ({ page }) => {
    await page.goto('/dashboard?industry=nonprofit');
    await page.waitForSelector('[data-testid="nonprofit-dashboard"]', { timeout: 10000 });
    
    // Verify Nonprofit-specific elements
    await expect(page.locator('[data-testid="donor-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="campaign-tracker"]')).toBeVisible();
    await expect(page.locator('[data-testid="grant-tracker"]')).toBeVisible();
  });

  test('should load Pet Care dashboard for petcare industry', async ({ page }) => {
    await page.goto('/dashboard?industry=petcare');
    await page.waitForSelector('[data-testid="petcare-dashboard"]', { timeout: 10000 });
    
    // Verify Pet Care-specific elements
    await expect(page.locator('[data-testid="health-records"]')).toBeVisible();
    await expect(page.locator('[data-testid="vaccination-tracker"]')).toBeVisible();
  });

  test('should load Real Estate dashboard for realestate industry', async ({ page }) => {
    await page.goto('/dashboard?industry=realestate');
    await page.waitForSelector('[data-testid="realestate-dashboard"]', { timeout: 10000 });
    
    // Verify Real Estate-specific elements
    await expect(page.locator('[data-testid="property-listings"]')).toBeVisible();
    await expect(page.locator('[data-testid="showing-scheduler"]')).toBeVisible();
  });

  test('should load Travel dashboard for travel industry', async ({ page }) => {
    await page.goto('/dashboard?industry=travel');
    await page.waitForSelector('[data-testid="travel-dashboard"]', { timeout: 10000 });
    
    // Verify Travel-specific elements
    await expect(page.locator('[data-testid="booking-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="itineraries"]')).toBeVisible();
  });

  test('should load SaaS dashboard for saas industry', async ({ page }) => {
    await page.goto('/dashboard?industry=saas');
    await page.waitForSelector('[data-testid="saas-dashboard"]', { timeout: 10000 });
    
    // Verify SaaS-specific elements
    await expect(page.locator('[data-testid="subscription-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="mrr-tracking"]')).toBeVisible();
  });

  test('should fall back to UniversalProDashboard for unsupported industries', async ({ page }) => {
    await page.goto('/dashboard?industry=retail');
    
    // Should load UniversalProDashboard (check for universal elements)
    await page.waitForSelector('[data-testid="universal-dashboard"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="overview-metrics"]')).toBeVisible();
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Mock slow network
    await page.route('**/api/dashboard/industry-engine', route => 
      route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: { industry: 'events' } }),
        headers: { 'access-control-allow-origin': '*' }
      }).then(() => new Promise(resolve => setTimeout(resolve, 2000)))
    );

    await page.goto('/dashboard?industry=events');
    
    // Should show loading state
    await expect(page.locator('text=Loading events dashboard...')).toBeVisible();
  });

  test('should handle error state gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/dashboard/industry-engine', route => 
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Failed to load' })
      })
    );

    await page.goto('/dashboard?industry=events');
    
    // Should show error or fallback
    await page.waitForTimeout(3000);
    // Either shows error or falls back to universal dashboard
    const hasError = await page.locator('[data-testid="error-state"]').isVisible();
    const hasFallback = await page.locator('[data-testid="universal-dashboard"]').isVisible();
    expect(hasError || hasFallback).toBeTruthy();
  });
});
