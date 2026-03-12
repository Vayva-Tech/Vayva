import { test, expect } from '@playwright/test';

test.describe('Legal Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/legal');
  });

  test('should load legal dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Legal/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should display matter management dashboard', async ({ page }) => {
    const matterManagement = page.locator('[data-testid="matter-management-dashboard"]');
    await expect(matterManagement).toBeVisible();
    
    // Check for key metrics
    await expect(page.locator('[data-testid="active-matters-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="win-rate-display"]')).toBeVisible();
    await expect(page.locator('[data-testid="matter-stages-overview"]')).toBeVisible();
  });

  test('should create and track a new matter', async ({ page }) => {
    // Click create new matter
    await page.click('[data-testid="create-new-matter"]');
    
    // Fill matter details
    await page.fill('[name="matterName"]', 'Smith v. Johnson Corp');
    await page.selectOption('[name="practiceArea"]', 'litigation');
    await page.selectOption('[name="stage"]', 'discovery');
    
    // Save matter
    await page.click('[data-testid="save-matter"]');
    
    // Verify matter was created
    await expect(page.locator('[data-testid="matter-created-success"]')).toBeVisible({ timeout: 5000 });
    
    // Verify matter appears in list
    await expect(page.locator('[data-testid="matters-list"]')).toContainText('Smith v. Johnson Corp');
  });

  test('should display client portal interface', async ({ page }) => {
    const clientPortal = page.locator('[data-testid="client-portal"]');
    await expect(clientPortal).toBeVisible();
    
    // Check client information sections
    await expect(page.locator('[data-testid="client-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="matter-updates"]')).toBeVisible();
    await expect(page.locator('[data-testid="document-sharing"]')).toBeVisible();
  });

  test('should track billable hours with time tracking UI', async ({ page }) => {
    const timeTracking = page.locator('[data-testid="time-tracking-ui"]');
    await expect(timeTracking).toBeVisible();
    
    // Start timer
    await page.click('[data-testid="start-timer"]');
    await expect(page.locator('[data-testid="timer-running"]')).toBeVisible();
    
    // Stop timer after some time
    await page.click('[data-testid="stop-timer"]');
    
    // Verify time entry was created
    await expect(page.locator('[data-testid="time-entries-list"]')).toBeVisible();
  });

  test('should generate invoice from billing interface', async ({ page }) => {
    const billingInterface = page.locator('[data-testid="billing-interface"]');
    await expect(billingInterface).toBeVisible();
    
    // Select time entries for invoicing
    await page.click('[data-testid="select-time-entries"]');
    await page.check('[data-testid="time-entry-checkbox"]:first-child');
    
    // Generate invoice
    await page.click('[data-testid="generate-invoice"]');
    
    // Fill invoice details
    await page.fill('[name="invoiceNumber"]', 'INV-2024-001');
    await page.fill('[name="amount"]', '5000.00');
    
    // Submit invoice
    await page.click('[data-testid="submit-invoice"]');
    
    // Verify invoice creation
    await expect(page.locator('[data-testid="invoice-created-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display practice area analytics', async ({ page }) => {
    const analyticsSection = page.locator('[data-testid="practice-area-analytics"]');
    await expect(analyticsSection).toBeVisible();
    
    // Check for charts and metrics
    await expect(page.locator('[data-testid="practice-area-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="win-loss-ratio"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-by-practice-area"]')).toBeVisible();
  });

  test('should filter matters by stage and status', async ({ page }) => {
    // Open filters
    await page.click('[data-testid="open-filters"]');
    
    // Filter by stage
    await page.selectOption('[name="filterStage"]', 'discovery');
    
    // Filter by status
    await page.selectOption('[name="filterStatus"]', 'active');
    
    // Apply filters
    await page.click('[data-testid="apply-filters"]');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="filtered-matters"]')).toBeVisible();
  });
});
