/**
 * Visual Regression Testing Configuration
 * Uses Percy for automated visual testing
 */

import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

// Key pages to capture for visual regression
const PAGES_TO_TEST = [
  { name: 'Dashboard Home', url: '/dashboard' },
  { name: 'Retail Dashboard', url: '/dashboard/retail' },
  { name: 'Fashion Dashboard', url: '/dashboard/fashion' },
  { name: 'Grocery Dashboard', url: '/dashboard/grocery' },
  { name: 'Healthcare Dashboard', url: '/dashboard/healthcare-services' },
  { name: 'Legal Dashboard', url: '/dashboard/legal' },
  { name: 'Nonprofit Dashboard', url: '/dashboard/nonprofit' },
  { name: 'Nightlife Dashboard', url: '/dashboard/nightlife' },
  { name: 'Creative Dashboard', url: '/dashboard/creative' },
  { name: 'Settings Page', url: '/dashboard/settings' },
  { name: 'Analytics Page', url: '/dashboard/analytics' },
];

// Mobile breakpoints to test
const MOBILE_BREAKPOINTS = [
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'merchant@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  for (const pageConfig of PAGES_TO_TEST) {
    test(`should match baseline for ${pageConfig.name}`, async ({ page }) => {
      await page.goto(pageConfig.url);
      await page.waitForLoadState('networkidle');
      
      // Capture desktop view
      await percySnapshot(page, `${pageConfig.name} - Desktop`);
      
      // Test responsive views
      for (const breakpoint of MOBILE_BREAKPOINTS) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await page.waitForTimeout(500); // Wait for responsive layout
        
        await percySnapshot(page, `${pageConfig.name} - ${breakpoint.name}`);
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  }

  test('should capture loading states', async ({ page }) => {
    // Navigate away and back to trigger loading state
    await page.goto('/dashboard/analytics');
    await page.goto('/dashboard');
    
    // Percy will capture the loading skeleton
    await percySnapshot(page, 'Loading State - Dashboard');
  });

  test('should capture error states', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/*', route => route.abort('failed'));
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    await percySnapshot(page, 'Error State - Network Failure');
  });

  test('should capture empty states', async ({ page }) => {
    // Navigate to a page that might have empty data
    await page.goto('/dashboard/campaigns');
    await percySnapshot(page, 'Empty State - Campaigns');
  });
});

test.describe('Component Visual Tests', () => {
  test('should render stat cards correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Focus on stat cards section
    const statCards = await page.$('.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
    if (statCards) {
      await percySnapshot(page, 'Stat Cards Component', { scope: '.grid' });
    }
  });

  test('should render tables correctly', async ({ page }) => {
    await page.goto('/dashboard/retail');
    await page.waitForLoadState('networkidle');
    
    const table = await page.$('table, .table-container');
    if (table) {
      await percySnapshot(page, 'Data Table Component', { scope: 'table, .table-container' });
    }
  });

  test('should render forms correctly', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    
    await percySnapshot(page, 'Form Components');
  });

  test('should render modals correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trigger a modal if available
    const modalTrigger = await page.$('button:has-text("Add"), button:has-text("Create")');
    if (modalTrigger) {
      await modalTrigger.click();
      await page.waitForTimeout(500);
      await percySnapshot(page, 'Modal Dialog Component');
    }
  });
});

test.describe('Dark Mode Visual Tests', () => {
  test('should render correctly in dark mode', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Enable dark mode if toggle exists
    const darkModeToggle = await page.$('[data-theme="dark"], .dark-mode-toggle');
    if (darkModeToggle) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      await percySnapshot(page, 'Dashboard - Dark Mode');
    }
  });
});
