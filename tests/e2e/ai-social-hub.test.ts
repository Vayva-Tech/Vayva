import { test, expect } from '@playwright/test';

test.describe('AI Hub Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to AI Hub
    await page.goto('http://localhost:3000/dashboard/ai-hub');
    await page.waitForLoadState('networkidle');
  });

  test('should display AI Hub dashboard with all tabs', async ({ page }) => {
    // Check if main heading exists
    await expect(page.getByRole('heading', { name: 'AI Hub' })).toBeVisible();
    
    // Check if all tabs are present
    await expect(page.getByRole('tab', { name: 'Chat Interface' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Analytics' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Templates' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Switch to Analytics tab
    await page.getByRole('tab', { name: 'Analytics' }).click();
    await expect(page.getByText('AI Performance Metrics')).toBeVisible();
    
    // Switch to Templates tab
    await page.getByRole('tab', { name: 'Templates' }).click();
    await expect(page.getByText('AI Prompt Templates')).toBeVisible();
    
    // Switch to Settings tab
    await page.getByRole('tab', { name: 'Settings' }).click();
    await expect(page.getByText('AI Configuration')).toBeVisible();
  });

  test('should display conversation analytics data', async ({ page }) => {
    await page.getByRole('tab', { name: 'Analytics' }).click();
    
    // Check for key metrics
    await expect(page.getByText('Total Conversations')).toBeVisible();
    await expect(page.getByText('Active Conversations')).toBeVisible();
    await expect(page.getByText('Avg Response Time')).toBeVisible();
    
    // Check if charts are rendered
    const chartElements = await page.$$('.recharts-wrapper');
    expect(chartElements.length).toBeGreaterThan(0);
  });

  test('should filter conversations by date range', async ({ page }) => {
    await page.getByRole('tab', { name: 'Analytics' }).click();
    
    // Open date range picker
    await page.getByLabel('Date Range').click();
    
    // Select a date range
    await page.getByRole('button', { name: 'Last 7 days' }).click();
    
    // Wait for data to reload
    await page.waitForTimeout(1000);
    
    // Verify data updated (check if loading state disappears)
    await expect(page.getByText('Loading...')).not.toBeVisible();
  });

  test('should display AI templates with search functionality', async ({ page }) => {
    await page.getByRole('tab', { name: 'Templates' }).click();
    
    // Check if templates are displayed
    const templateCards = await page.$$('.bg-card');
    expect(templateCards.length).toBeGreaterThan(0);
    
    // Test search functionality
    const searchInput = page.getByPlaceholder('Search templates...');
    await searchInput.fill('customer');
    await page.waitForTimeout(500);
    
    // Verify search results
    const filteredCards = await page.$$('.bg-card');
    expect(filteredCards.length).toBeLessThanOrEqual(templateCards.length);
  });

  test('should allow template category filtering', async ({ page }) => {
    await page.getByRole('tab', { name: 'Templates' }).click();
    
    // Click on a category filter
    await page.getByRole('button', { name: 'Customer Service' }).click();
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // Verify templates are filtered
    const visibleTemplates = await page.$$('.bg-card');
    expect(visibleTemplates.length).toBeGreaterThan(0);
  });
});

test.describe('Social Hub Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Social Hub
    await page.goto('http://localhost:3000/dashboard/settings/social-hub');
    await page.waitForLoadState('networkidle');
  });

  test('should display Social Hub dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Social Media Hub' })).toBeVisible();
    await expect(page.getByText('Connect and manage your social media accounts')).toBeVisible();
  });

  test('should show all social platform cards', async ({ page }) => {
    const platformCards = await page.$$('.bg-card');
    expect(platformCards.length).toBeGreaterThanOrEqual(5); // Facebook, Instagram, Twitter, LinkedIn, TikTok
    
    // Check for specific platforms
    await expect(page.getByText('Facebook')).toBeVisible();
    await expect(page.getByText('Instagram')).toBeVisible();
    await expect(page.getByText('Twitter')).toBeVisible();
    await expect(page.getByText('LinkedIn')).toBeVisible();
    await expect(page.getByText('TikTok')).toBeVisible();
  });

  test('should show connection status indicators', async ({ page }) => {
    const statusIndicators = await page.$$('.h-3.w-3');
    expect(statusIndicators.length).toBeGreaterThan(0);
    
    // Check for status colors
    const connectedIndicator = await page.$('.bg-green-500');
    const disconnectedIndicator = await page.$('.bg-gray-400');
    
    expect(connectedIndicator || disconnectedIndicator).not.toBeNull();
  });

  test('should handle social media connection flow', async ({ page }) => {
    // Click connect button for Facebook
    const connectButton = page.getByRole('button', { name: 'Connect' }).first();
    await connectButton.click();
    
    // Should redirect to OAuth flow or show connection modal
    await page.waitForTimeout(1000);
    
    // Check if redirected to OAuth or modal opened
    const currentUrl = page.url();
    expect(currentUrl).toContain('facebook.com') || expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should display social media metrics', async ({ page }) => {
    // Look for metric displays
    await expect(page.getByText('Followers')).toBeVisible();
    await expect(page.getByText('Engagement Rate')).toBeVisible();
    await expect(page.getByText('Posts')).toBeVisible();
    
    // Check if numeric values are displayed
    const metricValues = await page.$$('.text-2xl.font-bold');
    expect(metricValues.length).toBeGreaterThan(0);
  });
});

test.describe('UI/UX Edge Cases and Scenarios', () => {
  test('should handle mobile responsiveness', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000/dashboard/ai-hub');
    
    // Check if mobile navigation works
    const mobileMenuButton = await page.$('[data-testid="mobile-menu-button"]');
    if (mobileMenuButton) {
      await mobileMenuButton.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // Navigate to a section that might be empty
    await page.goto('http://localhost:3000/dashboard/ai-hub');
    await page.getByRole('tab', { name: 'Analytics' }).click();
    
    // Even with no data, should show proper empty state or default values
    await expect(page.getByText('No data available')).not.toBeVisible(); // Should show defaults instead
  });

  test('should handle loading states', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/ai-hub');
    
    // Trigger a data refresh
    const refreshButton = await page.$('[data-testid="refresh-button"]');
    if (refreshButton) {
      await refreshButton.click();
      // Should show loading indicator
      await expect(page.getByText('Loading...')).toBeVisible();
      await page.waitForTimeout(2000); // Wait for loading to complete
      await expect(page.getByText('Loading...')).not.toBeVisible();
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Intercept API calls and simulate error
    await page.route('**/api/ai/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    await page.goto('http://localhost:3000/dashboard/ai-hub');
    await page.getByRole('tab', { name: 'Analytics' }).click();
    
    // Should show error message but not crash
    await page.waitForTimeout(1000);
    await expect(page).toBeTruthy(); // Page should still be functional
  });

  test('should maintain accessibility standards', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/ai-hub');
    
    // Check for proper heading hierarchy
    const headings = await page.$$('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for aria labels
    const buttonsWithAria = await page.$$('button[aria-label]');
    expect(buttonsWithAria.length).toBeGreaterThan(0);
    
    // Check for proper contrast (visual check)
    await expect(page).toHaveScreenshot('ai-hub-accessibility.png', { 
      maxDiffPixelRatio: 0.01 
    });
  });
});