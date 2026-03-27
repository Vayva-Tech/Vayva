/**
 * Grocery Dashboard E2E Tests
 * Comprehensive end-to-end test scenarios for grocery dashboard workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Grocery Dashboard', () => {
  // Test scenario 1: All widgets display correctly
  test('displays all 6 dashboard widgets', async ({ page }) => {
    await page.goto('/dashboard/grocery');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Verify all 6 main widgets are visible
    await expect(page.locator('text=Promotion Performance')).toBeVisible();
    await expect(page.locator('text=Price Optimization')).toBeVisible();
    await expect(page.locator('text=Expiration Tracking')).toBeVisible();
    await expect(page.locator('text=Supplier Deliveries')).toBeVisible();
    await expect(page.locator('text=Stock Levels')).toBeVisible();
    await expect(page.locator('text=Action Required')).toBeVisible();
    
    // Verify stat cards at the top
    await expect(page.locator('text=Sales Today')).toBeVisible();
    await expect(page.locator('text=Transactions')).toBeVisible();
  });

  // Test scenario 2: Apply price optimization recommendation
  test('applies price optimization recommendation', async ({ page }) => {
    await page.goto('/dashboard/grocery');
    await page.waitForLoadState('networkidle');
    
    // Find and click the first "Apply" button in Price Optimization
    const applyButton = page.locator('[data-testid="apply-price-change"]').first();
    
    // Check if button exists (might not have data in test environment)
    const isVisible = await applyButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await applyButton.click();
      
      // Wait for success toast/notification
      await expect(
        page.locator('text=Price updated successfully')
      ).toBeVisible({ timeout: 5000 });
    } else {
      // If no data, verify empty state is shown instead
      await expect(
        page.locator('text=/no pricing data|no recommendations/i')
      ).toBeVisible();
    }
  });

  // Test scenario 3: Track expiration and apply markdown
  test('tracks expiration and applies markdown action', async ({ page }) => {
    await page.goto('/dashboard/grocery');
    await page.waitForLoadState('networkidle');
    
    // Look for markdown button in Expiration Tracking widget
    const markdownBtn = page.locator('[data-testid="apply-markdown"]').first();
    const isVisible = await markdownBtn.isVisible().catch(() => false);
    
    if (isVisible) {
      await markdownBtn.click();
      
      // Wait for confirmation
      await expect(
        page.locator('text=Markdown applied')
      ).toBeVisible({ timeout: 5000 });
    } else {
      // Verify empty state or no expiring products message
      await expect(
        page.locator('text=/no expiring products/i')
      ).toBeVisible();
    }
  });

  // Test scenario 4: View supplier delivery dock assignments
  test('views supplier delivery dock assignments', async ({ page }) => {
    await page.goto('/dashboard/grocery');
    await page.waitForLoadState('networkidle');
    
    // Check for dock door information
    const dockDoorLocator = page.locator('[data-testid="dock-door"]');
    const hasDockDoors = await dockDoorLocator.count().then(c => c > 0).catch(() => false);
    
    if (hasDockDoors) {
      await expect(dockDoorLocator.first()).toContainText('Dock');
    } else {
      // Alternative: check for dock info in text content
      await expect(
        page.locator('text=/Dock \\d+|dock door/i')
      ).toBeVisible();
    }
  });

  // Test scenario 5: Mark task as complete in Action Required widget
  test('marks task as complete', async ({ page }) => {
    await page.goto('/dashboard/grocery');
    await page.waitForLoadState('networkidle');
    
    // Find mark complete button
    const completeBtn = page.locator('[data-testid="mark-complete"]').first();
    const isVisible = await completeBtn.isVisible().catch(() => false);
    
    if (isVisible) {
      await completeBtn.click();
      
      // Wait for success notification
      await expect(
        page.locator('text=Task completed')
      ).toBeVisible({ timeout: 5000 });
      
      // Verify task is marked as complete (should disappear or show completed state)
      await expect(completeBtn).not.toBeVisible({ timeout: 5000 });
    } else {
      // Verify all caught up message
      await expect(
        page.locator('text=/all caught up|no tasks/i')
      ).toBeVisible();
    }
  });

  // Test scenario 6: Handle API error gracefully
  test('handles API error gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('/api/grocery/dashboard', route => route.abort());
    
    await page.goto('/dashboard/grocery');
    
    // Should show error state with retry option
    await expect(
      page.locator('text=/error|failed to load/i')
    ).toBeVisible({ timeout: 10000 });
    
    // Verify retry button is available
    const retryBtn = page.locator('button:text-has-text("Retry")');
    await expect(retryBtn).toBeVisible();
    
    // Click retry and verify it attempts to reload
    await retryBtn.click();
    
    // The component should attempt to refetch (may still fail, but we're testing the retry flow)
    await page.waitForTimeout(2000);
  });

  // Test scenario 7: Display custom skeleton during loading
  test('displays custom skeleton during loading', async ({ page }) => {
    // Simulate slow network by delaying API response
    await page.route('/api/grocery/dashboard', async route => {
      // Wait 2 seconds before continuing (simulating slow network)
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await page.goto('/dashboard/grocery');
    
    // Should show skeleton immediately (before 2 second delay)
    await expect(
      page.locator('[data-testid="skeleton-card"]')
    ).toBeVisible({ timeout: 3000 });
    
    // Or check for shimmer animation (alternative indicator of skeleton)
    await expect(
      page.locator('.animate-pulse')
    ).toBeVisible({ timeout: 3000 });
    
    // After loading completes, skeleton should disappear
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('[data-testid="skeleton-card"]')
    ).not.toBeVisible({ timeout: 5000 });
  });

  // Additional test scenario 8: Mobile responsiveness
  test('dashboard is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    
    await page.goto('/dashboard/grocery');
    await page.waitForLoadState('networkidle');
    
    // Verify no horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
    
    // Verify widgets stack vertically
    const widgets = page.locator('[class*="grid"] > div').first();
    await expect(widgets).toBeVisible();
    
    // Verify touch targets are large enough (minimum 44x44px)
    const buttons = page.locator('button').first();
    const buttonBox = await buttons.boundingBox();
    if (buttonBox) {
      expect(buttonBox.width).toBeGreaterThanOrEqual(44);
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  // Additional test scenario 9: Data refresh functionality
  test('refreshes data when refetch is triggered', async ({ page }) => {
    await page.goto('/dashboard/grocery');
    await page.waitForLoadState('networkidle');
    
    // Get initial data timestamp (if available)
    const initialTimestamp = await page.locator('[data-testid="timestamp"]').textContent();
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Trigger refresh (if refresh button exists)
    const refreshBtn = page.locator('[data-testid="refresh"]');
    const isVisible = await refreshBtn.isVisible().catch(() => false);
    
    if (isVisible) {
      await refreshBtn.click();
      await page.waitForLoadState('networkidle');
      
      // Timestamp should update
      const newTimestamp = await page.locator('[data-testid="timestamp"]').textContent();
      expect(newTimestamp).not.toBe(initialTimestamp);
    }
  });

  // Additional test scenario 10: Error boundaries catch component failures
  test('error boundaries catch and display component failures', async ({ page }) => {
    await page.goto('/dashboard/grocery');
    await page.waitForLoadState('networkidle');
    
    // Mock one component's API to fail while others succeed
    await page.route('/api/grocery/promotions', route => route.abort());
    
    // Reload to trigger the mocked failure
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should show component-level error, not crash entire page
    await expect(
      page.locator('text=/failed to load|component error/i')
    ).toBeVisible();
    
    // Other widgets should still be visible
    await expect(
      page.locator('text=Stock Levels')
    ).toBeVisible();
  });
});
