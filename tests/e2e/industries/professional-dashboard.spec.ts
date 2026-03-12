import { test, expect } from '@playwright/test';

test.describe('Professional Services Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/professional');
  });

  test('should load professional services dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Professional/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should display matter management dashboard', async ({ page }) => {
    const matterDashboard = page.locator('[data-testid="matter-management-dashboard"]');
    await expect(matterDashboard).toBeVisible();
    
    // Check active matters count
    await expect(page.locator('[data-testid="active-matters-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-tasks"]')).toBeVisible();
  });

  test('should create new client matter', async ({ page }) => {
    await page.click('[data-testid="create-new-matter"]');
    
    await page.fill('[name="matterName"]', 'Consulting Engagement - ABC Corp');
    await page.fill('[name="clientName"]', 'ABC Corporation');
    await page.selectOption('[name="serviceType"]', 'consulting');
    
    await page.click('[data-testid="save-matter"]');
    await expect(page.locator('[data-testid="matter-created-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display client portal interface', async ({ page }) => {
    const clientPortal = page.locator('[data-testid="client-portal"]');
    await expect(clientPortal).toBeVisible();
    
    // Check client communication tools
    await expect(page.locator('[data-testid="client-messages"]')).toBeVisible();
    await expect(page.locator('[data-testid="shared-documents"]')).toBeVisible();
  });

  test('should send update to client', async ({ page }) => {
    await page.click('[data-testid="send-client-update"]');
    
    await page.fill('[data-testid="update-message"]', 'Project milestone completed on schedule');
    await page.attach('[data-testid="attachment-upload"]', { path: 'report.pdf' });
    
    await page.click('[data-testid="send-update"]');
    await expect(page.locator('[data-testid="update-sent-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should track time entries', async ({ page }) => {
    const timeTracking = page.locator('[data-testid="time-tracking-ui"]');
    await expect(timeTracking).toBeVisible();
    
    // Start timer
    await page.click('[data-testid="start-timer"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="stop-timer"]');
    
    // Verify time entry created
    await expect(page.locator('[data-testid="time-entry-created"]')).toBeVisible({ timeout: 3000 });
  });

  test('should generate invoice from billable hours', async ({ page }) => {
    const billingInterface = page.locator('[data-testid="billing-interface"]');
    await expect(billingInterface).toBeVisible();
    
    // Select billable entries
    await page.check('[data-testid="billable-entry-checkbox"]:first-child');
    await page.click('[data-testid="generate-invoice"]');
    
    await page.fill('[name="invoiceAmount"]', '2500.00');
    await page.click('[data-testid="finalize-invoice"]');
    
    await expect(page.locator('[data-testid="invoice-generated-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display utilization metrics', async ({ page }) => {
    const utilizationMetrics = page.locator('[data-testid="utilization-metrics"]');
    await expect(utilizationMetrics).toBeVisible();
    
    // Check key metrics
    await expect(page.locator('[data-testid="utilization-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="realization-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="revenue-per-employee"]')).toBeVisible();
  });

  test('should filter matters by practice area', async ({ page }) => {
    await page.selectOption('[data-testid="practice-area-filter"]', 'tax');
    
    await expect(page.locator('[data-testid="filtered-matters-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="matter-item"]')).toContainText('Tax');
  });
});
