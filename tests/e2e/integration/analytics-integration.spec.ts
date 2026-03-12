import { test, expect } from '@playwright/test';

test.describe('Analytics Integration', () => {
  test('should track events through collection pipeline', async ({ page }) => {
    await page.goto('/dashboard/retail');
    
    // Trigger analytics event
    await page.click('[data-testid="pos-system"]');
    
    // Verify event was captured
    const responsePromise = page.waitForResponse('**/api/analytics/events');
    await page.click('[data-testid="complete-sale"]');
    const response = await responsePromise;
    
    expect(response.status()).toBe(200);
  });

  test('should display real-time aggregation updates', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // Watch for real-time updates
    const initialMetrics = await page.locator('[data-testid="real-time-metrics"]').textContent();
    
    // Wait for aggregation update (every 30 seconds)
    await page.waitForTimeout(31000);
    
    const updatedMetrics = await page.locator('[data-testid="real-time-metrics"]').textContent();
    expect(updatedMetrics).not.toBe(initialMetrics);
  });

  test('should visualize cohort analysis data', async ({ page }) => {
    await page.goto('/dashboard/analytics/cohorts');
    
    const cohortTable = page.locator('[data-testid="cohort-table"]');
    await expect(cohortTable).toBeVisible();
    
    // Check retention visualization
    await expect(page.locator('[data-testid="retention-heatmap"]')).toBeVisible();
  });

  test('should display A/B testing dashboard with statistical significance', async ({ page }) => {
    await page.goto('/dashboard/analytics/ab-testing');
    
    const abTestWidget = page.locator('[data-testid="ab-testing-widget"]');
    await expect(abTestWidget).toBeVisible();
    
    // Check variant metrics
    await expect(page.locator('[data-testid="variant-a-conversion"]')).toBeVisible();
    await expect(page.locator('[data-testid="variant-b-conversion"]')).toBeVisible();
    
    // Verify statistical significance indicator
    await expect(page.locator('[data-testid="significance-indicator"]')).toBeVisible();
  });

  test('should integrate finance analytics widgets', async ({ page }) => {
    await page.goto('/dashboard/analytics/finance');
    
    const financeWidget = page.locator('[data-testid="finance-analytics-widget"]');
    await expect(financeWidget).toBeVisible();
    
    // Check revenue breakdown
    await expect(page.locator('[data-testid="revenue-breakdown-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="profit-margin-trend"]')).toBeVisible();
  });

  test('should display marketing ROI tracker with attribution', async ({ page }) => {
    await page.goto('/dashboard/analytics/marketing');
    
    const roiTracker = page.locator('[data-testid="roi-tracker-widget"]');
    await expect(roiTracker).toBeVisible();
    
    // Check channel performance
    await expect(page.locator('[data-testid="channel-roas-chart"]')).toBeVisible();
    
    // Verify attribution data
    await expect(page.locator('[data-testid="attribution-model"]')).toBeVisible();
  });
});
