import { test, expect } from '@playwright/test';

test.describe('Cross-Industry Integration', () => {
  test('should support multi-industry business switching', async ({ page }) => {
    // Login as multi-industry user
    await page.goto('/login');
    await page.fill('[name="email"]', 'multi@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('[type="submit"]');
    
    // Switch between industries
    await page.goto('/dashboard/restaurant');
    await expect(page.locator('[data-testid="dashboard-header"]')).toContainText('Restaurant');
    
    await page.click('[data-testid="switch-industry"]');
    await page.click('[data-testid="industry-option-retail"]');
    await expect(page.locator('[data-testid="dashboard-header"]')).toContainText('Retail');
    
    await page.click('[data-testid="switch-industry"]');
    await page.click('[data-testid="industry-option-healthcare"]');
    await expect(page.locator('[data-testid="dashboard-header"]')).toContainText('Healthcare');
  });

  test('should share customer data across industries', async ({ page }) => {
    await page.goto('/dashboard/retail');
    
    // Create customer in retail
    await page.click('[data-testid="add-customer"]');
    await page.fill('[name="customerName"]', 'Shared Customer');
    await page.fill('[name="customerEmail"]', 'shared@example.com');
    await page.click('[data-testid="save-customer"]');
    
    // Navigate to restaurant and find same customer
    await page.goto('/dashboard/restaurant');
    await page.fill('[data-testid="customer-search"]', 'shared@example.com');
    await expect(page.locator('[data-testid="customer-profile"]')).toContainText('Shared Customer');
  });

  test('should maintain unified authentication across industry dashboards', async ({ page }) => {
    // Start at one dashboard
    await page.goto('/dashboard/healthcare');
    await expect(page).toHaveURL(/\/dashboard\/healthcare/);
    
    // Navigate to another dashboard
    await page.goto('/dashboard/legal');
    await expect(page).toHaveURL(/\/dashboard\/legal/);
    
    // Verify session persists
    const cookies = await page.context().cookies();
    expect(cookies.some(c => c.name.includes('session'))).toBe(true);
    
    // Navigate back to first dashboard
    await page.goto('/dashboard/healthcare');
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should sync inventory updates across sales channels', async ({ page }) => {
    // Update inventory in retail
    await page.goto('/dashboard/retail/inventory');
    const initialStock = await page.locator('[data-testid="stock-count"]:first-child').textContent();
    
    await page.click('[data-testid="adjust-stock"]:first-child');
    await page.fill('[data-testid="new-quantity"]', '50');
    await page.click('[data-testid="save-adjustment"]');
    await expect(page.locator('[data-testid="stock-updated-success"]')).toBeVisible({ timeout: 3000 });
    
    // Check inventory reflects in food dashboard (if shared product)
    await page.goto('/dashboard/food/inventory');
    await expect(page.locator('[data-testid="inventory-synced"]')).toBeVisible();
  });

  test('should aggregate analytics across all industries', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // Check for cross-industry metrics
    await expect(page.locator('[data-testid="cross-industry-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="multi-location-performance"]')).toBeVisible();
    
    // Verify consolidated reporting
    await page.click('[data-testid="generate-consolidated-report"]');
    await expect(page.locator('[data-testid="report-includes-all-industries"]')).toBeVisible({ timeout: 5000 });
  });

  test('should share templates across industries', async ({ page }) => {
    await page.goto('/templates');
    
    // Save template from one industry
    await page.click('[data-testid="template-card"]:first-child');
    await page.click('[data-testid="save-template"]');
    await page.selectOption('[data-testid="template-scope"]', 'all-industries');
    await page.click('[data-testid="confirm-save"]');
    await expect(page.locator('[data-testid="template-saved-success"]')).toBeVisible({ timeout: 3000 });
    
    // Access template from different industry
    await page.goto('/dashboard/restaurant/templates');
    await expect(page.locator('[data-testid="saved-templates"]')).toContainText('First Template');
  });

  test('should maintain consistent permissions across industry boundaries', async ({ page }) => {
    await page.goto('/settings/permissions');
    
    // Set permission for role
    await page.click('[data-testid="add-role-permission"]');
    await page.selectOption('[data-testid="role-select"]', 'manager');
    await page.check('[data-testid="permission-analytics-view"]');
    await page.click('[data-testid="save-permission"]');
    
    // Verify permission applies across industries
    await page.goto('/dashboard/retail/analytics');
    await expect(page.locator('[data-testid="analytics-widget"]')).toBeVisible();
    
    await page.goto('/dashboard/healthcare/analytics');
    await expect(page.locator('[data-testid="analytics-widget"]')).toBeVisible();
  });

  test('should handle cross-industry workflow automation', async ({ page }) => {
    await page.goto('/automation/workflows');
    
    // Create workflow that spans industries
    await page.click('[data-testid="create-workflow"]');
    await page.fill('[data-testid="workflow-name"]', 'Multi-Industry Order Processing');
    
    // Add trigger from retail
    await page.click('[data-testid="add-trigger"]');
    await page.selectOption('[data-testid="trigger-source"]', 'retail-order-placed');
    
    // Add action in inventory
    await page.click('[data-testid="add-action"]');
    await page.selectOption('[data-testid="action-target"]', 'inventory-update-stock');
    
    // Add notification in analytics
    await page.click('[data-testid="add-action"]');
    await page.selectOption('[data-testid="action-target"]', 'analytics-track-event');
    
    await page.click('[data-testid="activate-workflow"]');
    await expect(page.locator('[data-testid="workflow-activated"]')).toBeVisible({ timeout: 3000 });
  });
});
