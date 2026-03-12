import { test, expect } from '@playwright/test';

test.describe('Creative Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/creative');
  });

  test('should load creative dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Creative/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should display portfolio gallery', async ({ page }) => {
    const portfolioGallery = page.locator('[data-testid="portfolio-gallery"]');
    await expect(portfolioGallery).toBeVisible();
    
    // Check for project thumbnails
    await expect(page.locator('[data-testid="project-thumbnail"]:first-child')).toBeVisible();
    await expect(page.locator('[data-testid="add-project"]')).toBeVisible();
  });

  test('should upload new portfolio project', async ({ page }) => {
    await page.click('[data-testid="add-project"]');
    
    await page.fill('[name="projectName"]', 'New Creative Project');
    await page.fill('[name="clientName"]', 'Test Client');
    await page.fill('[name="projectDescription"]', 'A sample creative project');
    
    // Upload project image
    await page.setInputFiles('[data-testid="project-image"]', {
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('test-image-data')
    });
    
    await page.click('[data-testid="save-project"]');
    await expect(page.locator('[data-testid="project-saved-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display client proofing interface', async ({ page }) => {
    const clientProofing = page.locator('[data-testid="client-proofing-interface"]');
    await expect(clientProofing).toBeVisible();
    
    // Check for annotation tools
    await expect(page.locator('[data-testid="annotation-tools"]')).toBeVisible();
    await expect(page.locator('[data-testid="comment-section"]')).toBeVisible();
  });

  test('should add annotations to design', async ({ page }) => {
    // Open proofing tool
    await page.click('[data-testid="open-proofing-tool"]');
    
    // Add annotation
    await page.click('[data-testid="select-annotation-tool"]');
    await page.click('[data-testid="design-preview"]');
    await page.fill('[data-testid="annotation-comment"]', 'Please adjust the color');
    
    await page.click('[data-testid="submit-annotation"]');
    await expect(page.locator('[data-testid="annotation-added-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should track revisions with revision tracker', async ({ page }) => {
    const revisionTracker = page.locator('[data-testid="revision-tracker"]');
    await expect(revisionTracker).toBeVisible();
    
    // Check version history
    await expect(page.locator('[data-testid="version-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="revision-timeline"]')).toBeVisible();
  });

  test('should display project workflow board', async ({ page }) => {
    const workflowBoard = page.locator('[data-testid="project-workflow-board"]');
    await expect(workflowBoard).toBeVisible();
    
    // Check kanban columns
    await expect(page.locator('[data-testid="column-concept"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-review"]')).toBeVisible();
    await expect(page.locator('[data-testid="column-complete"]')).toBeVisible();
  });

  test('should move project through workflow stages', async ({ page }) => {
    // Drag and drop project card
    const projectCard = page.locator('[data-testid="project-card"]:first-child');
    const reviewColumn = page.locator('[data-testid="column-review"]');
    
    await projectCard.dragTo(reviewColumn);
    
    // Verify status updated
    await expect(page.locator('[data-testid="status-updated-toast"]')).toBeVisible({ timeout: 3000 });
  });

  test('should track billable hours for creative projects', async ({ page }) => {
    const timeTracking = page.locator('[data-testid="creative-time-tracking"]');
    await expect(timeTracking).toBeVisible();
    
    // Log time to project
    await page.click('[data-testid="log-time"]');
    await page.fill('[data-testid="hours-input"]', '2.5');
    await page.selectOption('[data-testid="project-select"]', 'Test Project');
    
    await page.click('[data-testid="submit-time-log"]');
    await expect(page.locator('[data-testid="time-logged-success"]')).toBeVisible({ timeout: 5000 });
  });
});
