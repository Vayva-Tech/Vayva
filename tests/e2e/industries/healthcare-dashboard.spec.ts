import { test, expect } from '@playwright/test';

test.describe('Healthcare Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to healthcare dashboard
    await page.goto('/dashboard/healthcare');
  });

  test('should load healthcare dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Healthcare/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should display patient intake forms component', async ({ page }) => {
    const patientIntakeForm = page.locator('[data-testid="patient-intake-forms"]');
    await expect(patientIntakeForm).toBeVisible();
    
    // Test form steps are visible
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();
    await expect(page.locator('text=Personal Information')).toBeVisible();
  });

  test('should complete patient intake form flow', async ({ page }) => {
    // Fill personal information
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="dateOfBirth"]', '1990-01-01');
    await page.fill('[name="email"]', 'john.doe@example.com');
    await page.fill('[name="phone"]', '555-0123');
    
    // Click next
    await page.click('button:has-text("Next")');
    
    // Fill insurance information
    await page.fill('[name="insuranceProvider"]', 'Blue Cross Blue Shield');
    await page.fill('[name="policyNumber"]', 'POL123456789');
    await page.fill('[name="groupNumber"]', 'GRP987654');
    
    // Click next
    await page.click('button:has-text("Next")');
    
    // Fill medical history
    await page.fill('[name="currentMedications"]', 'Lisinopril 10mg daily');
    await page.fill('[name="allergies"]', 'Penicillin');
    
    // Click next to consent
    await page.click('button:has-text("Next")');
    
    // Accept consents
    await page.check('[name="consentToTreatment"]');
    await page.check('[name="hipaaAcknowledgment"]');
    
    // Submit form
    await page.click('button:has-text("Submit Forms")');
    
    // Verify submission success
    await expect(page.locator('[data-testid="submission-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display HIPAA compliance tracker metrics', async ({ page }) => {
    const hipaaTracker = page.locator('[data-testid="hipaa-compliance-tracker"]');
    await expect(hipaaTracker).toBeVisible();
    
    // Check for compliance metrics
    await expect(page.locator('[data-testid="compliance-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-trail"]')).toBeVisible();
    await expect(page.locator('[data-testid="compliance-alerts"]')).toBeVisible();
  });

  test('should open treatment plan builder', async ({ page }) => {
    const treatmentPlanBuilder = page.locator('[data-testid="treatment-plan-builder"]');
    await expect(treatmentPlanBuilder).toBeVisible();
    
    // Test creating a new treatment plan
    await page.click('[data-testid="create-treatment-plan"]');
    await expect(page.locator('[data-testid="treatment-plan-editor"]')).toBeVisible();
    
    // Add a goal
    await page.fill('[data-testid="goal-input"]', 'Reduce blood pressure to normal range');
    await page.click('[data-testid="add-goal"]');
    await expect(page.locator('[data-testid="goal-list"]')).toContainText('Reduce blood pressure to normal range');
  });

  test('should verify insurance eligibility', async ({ page }) => {
    const insuranceVerification = page.locator('[data-testid="insurance-verification"]');
    await expect(insuranceVerification).toBeVisible();
    
    // Enter insurance details
    await page.fill('[name="insurancePolicyNumber"]', 'TEST123456789');
    await page.selectOption('[name="insuranceProvider"]', 'blue-cross');
    
    // Run verification
    await page.click('[data-testid="verify-eligibility"]');
    
    // Wait for verification result
    await expect(page.locator('[data-testid="eligibility-result"]')).toBeVisible({ timeout: 10000 });
  });

  test('should display medical records viewer', async ({ page }) => {
    const medicalRecordsViewer = page.locator('[data-testid="medical-records-viewer"]');
    await expect(medicalRecordsViewer).toBeVisible();
    
    // Check for timeline view
    await expect(page.locator('[data-testid="records-timeline"]')).toBeVisible();
    
    // Filter records by date
    await page.fill('[data-testid="date-range-start"]', '2024-01-01');
    await page.fill('[data-testid="date-range-end"]', '2024-12-31');
    await expect(page.locator('[data-testid="filtered-records"]')).toBeVisible();
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should move through interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check aria labels exist
    const dashboardRegion = page.locator('[aria-label="Dashboard widgets"]');
    await expect(dashboardRegion).toBeVisible();
  });
});
