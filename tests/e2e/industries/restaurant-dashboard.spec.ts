import { test, expect } from '@playwright/test';

test.describe('Restaurant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/restaurant');
  });

  test('should load restaurant dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Restaurant/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should display table management interface', async ({ page }) => {
    const tableManagement = page.locator('[data-testid="table-management"]');
    await expect(tableManagement).toBeVisible();
    
    // Check table status indicators
    await expect(page.locator('[data-testid="available-tables"]')).toBeVisible();
    await expect(page.locator('[data-testid="occupied-tables"]')).toBeVisible();
    await expect(page.locator('[data-testid="reserved-tables"]')).toBeVisible();
  });

  test('should manage reservations', async ({ page }) => {
    const reservationsSection = page.locator('[data-testid="reservations-section"]');
    await expect(reservationsSection).toBeVisible();
    
    // Create new reservation
    await page.click('[data-testid="new-reservation"]');
    await page.fill('[name="guestName"]', 'Test Guest');
    await page.fill('[name="partySize"]', '4');
    await page.fill('[name="reservationDate"]', '2024-12-25');
    await page.fill('[name="reservationTime"]', '19:00');
    
    await page.click('[data-testid="save-reservation"]');
    await expect(page.locator('[data-testid="reservation-confirmed"]')).toBeVisible({ timeout: 5000 });
  });

  test('should process customer orders', async ({ page }) => {
    const posInterface = page.locator('[data-testid="pos-interface"]');
    await expect(posInterface).toBeVisible();
    
    // Add items to order
    await page.click('[data-testid="menu-item"]:first-child');
    await page.click('[data-testid="add-to-order"]');
    
    // Submit order to kitchen
    await page.click('[data-testid="submit-order"]');
    await expect(page.locator('[data-testid="order-sent-to-kitchen"]')).toBeVisible();
  });

  test('should display inventory tracking', async ({ page }) => {
    const inventoryTracking = page.locator('[data-testid="inventory-tracking"]');
    await expect(inventoryTracking).toBeVisible();
    
    // Check stock levels
    await expect(page.locator('[data-testid="stock-levels"]')).toBeVisible();
    await expect(page.locator('[data-testid="low-stock-alerts"]')).toBeVisible();
  });

  test('should show sales analytics and reporting', async ({ page }) => {
    const salesAnalytics = page.locator('[data-testid="sales-analytics"]');
    await expect(salesAnalytics).toBeVisible();
    
    // Check revenue metrics
    await expect(page.locator('[data-testid="daily-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="popular-items"]')).toBeVisible();
  });
});
