import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/analytics');
  });

  test('should load analytics dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Analytics/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should display key metrics widgets', async ({ page }) => {
    const keyMetrics = page.locator('[data-testid="key-metrics-widget"]');
    await expect(keyMetrics).toBeVisible();
    
    // Check metric cards
    await expect(page.locator('[data-testid="metric-card"]:first-child')).toBeVisible();
    await expect(page.locator('[data-testid="trend-indicator"]')).toBeVisible();
  });

  test('should display trend charts', async ({ page }) => {
    const trendChart = page.locator('[data-testid="trend-chart-widget"]');
    await expect(trendChart).toBeVisible();
    
    // Check chart elements
    await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('should filter analytics by date range', async ({ page }) => {
    // Select date range
    await page.fill('[data-testid="date-range-start"]', '2024-01-01');
    await page.fill('[data-testid="date-range-end"]', '2024-12-31');
    
    // Apply filter
    await page.click('[data-testid="apply-date-filter"]');
    
    // Verify data updated
    await expect(page.locator('[data-testid="filtered-data-loaded"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display cohort analysis', async ({ page }) => {
    const cohortAnalysis = page.locator('[data-testid="cohort-analysis-widget"]');
    await expect(cohortAnalysis).toBeVisible();
    
    // Check cohort table
    await expect(page.locator('[data-testid="cohort-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="retention-rates"]')).toBeVisible();
  });

  test('should display A/B testing results', async ({ page }) => {
    const abTesting = page.locator('[data-testid="ab-testing-widget"]');
    await expect(abTesting).toBeVisible();
    
    // Check variant performance
    await expect(page.locator('[data-testid="variant-a-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="variant-b-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="statistical-significance"]')).toBeVisible();
  });

  test('should display finance analytics', async ({ page }) => {
    const financeAnalytics = page.locator('[data-testid="finance-analytics-widget"]');
    await expect(financeAnalytics).toBeVisible();
    
    // Check revenue metrics
    await expect(page.locator('[data-testid="revenue-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="profit-margins"]')).toBeVisible();
  });

  test('should display marketing ROI tracker', async ({ page }) => {
    const roiTracker = page.locator('[data-testid="roi-tracker-widget"]');
    await expect(roiTracker).toBeVisible();
    
    // Check channel performance
    await expect(page.locator('[data-testid="channel-roas"]')).toBeVisible();
    await expect(page.locator('[data-testid="attribution-data"]')).toBeVisible();
  });

  test('should export analytics report', async ({ page }) => {
    await page.click('[data-testid="export-report"]');
    
    // Select export format
    await page.click('[data-testid="export-format-pdf"]');
    
    // Download report
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-report"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('analytics-report');
  });

  test('should set up automated report scheduling', async ({ page }) => {
    await page.click('[data-testid="schedule-report"]');
    
    await page.fill('[data-testid="report-name"]', 'Weekly Analytics');
    await page.selectOption('[data-testid="report-frequency"]', 'weekly');
    await page.selectOption('[data-testid="report-day"]', 'monday');
    await page.fill('[data-testid="report-recipients"]', 'team@example.com');
    
    await page.click('[data-testid="save-schedule"]');
    await expect(page.locator('[data-testid="schedule-saved-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display predictive analytics insights', async ({ page }) => {
    const predictiveAnalytics = page.locator('[data-testid="predictive-analytics-widget"]');
    await expect(predictiveAnalytics).toBeVisible();
    
    // Check forecast data
    await expect(page.locator('[data-testid="forecast-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-interval"]')).toBeVisible();
  });
});
