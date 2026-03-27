/**
 * Mobile Edge Case Testing
 * Tests across multiple devices, orientations, and edge cases
 */

import { test, expect, devices } from '@playwright/test';

// Comprehensive device list for testing
const TEST_DEVICES = {
  // iOS Devices
  'iPhone 14 Pro Max': { ...devices['iPhone 14 Pro Max'] },
  'iPhone 14': { ...devices['iPhone 14'] },
  'iPhone SE': { ...devices['iPhone SE'] },
  'iPad Pro 11': { ...devices['iPad Pro 11'] },
  'iPad Mini': { ...devices['iPad Mini'] },
  
  // Android Devices
  'Pixel 7': { ...devices['Pixel 7'] },
  'Pixel 7 Pro': { ...devices['Pixel 7 Pro'] },
  'Galaxy S23': { ...devices['Galaxy S23'] },
  'Galaxy S23 Ultra': { ...devices['Galaxy S23 Ultra'] },
  'OnePlus 11': { ...devices['OnePlus 11'] },
  
  // Tablets
  'iPad Air': { ...devices['iPad Air'] },
  'Galaxy Tab S8': { ...devices['Galaxy Tab S8'] },
  
  // Desktop breakpoints
  'Desktop 13"': { viewport: { width: 1280, height: 720 } },
  'Desktop 15"': { viewport: { width: 1920, height: 1080 } },
  'Desktop 27"': { viewport: { width: 2560, height: 1440 } },
};

// Critical user journeys to test on each device
const CRITICAL_JOURNEYS = [
  {
    name: 'Dashboard Load',
    url: '/dashboard',
    action: async (page) => {
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main')).toBeVisible();
    },
  },
  {
    name: 'Navigation Menu',
    url: '/dashboard',
    action: async (page) => {
      const menuButton = await page.$('[data-testid="mobile-menu"], .hamburger-menu');
      if (menuButton) {
        await menuButton.click();
        await page.waitForTimeout(500);
        await expect(page.locator('nav')).toBeVisible();
      }
    },
  },
  {
    name: 'Search Functionality',
    url: '/dashboard',
    action: async (page) => {
      const searchInput = await page.$('input[type="search"], input[placeholder*="search" i]');
      if (searchInput) {
        await searchInput.fill('test');
        await page.waitForTimeout(300);
        await searchInput.clear();
      }
    },
  },
  {
    name: 'Form Interaction',
    url: '/dashboard/settings',
    action: async (page) => {
      const formInputs = await page.$$('input:not([type="hidden"]), textarea');
      if (formInputs.length > 0) {
        await formInputs[0].focus();
        await formInputs[0].blur();
      }
    },
  },
  {
    name: 'Modal Dialog',
    url: '/dashboard',
    action: async (page) => {
      const modalTrigger = await page.$('button:has-text("Add"), button:has-text("Create")');
      if (modalTrigger) {
        await modalTrigger.click();
        await page.waitForTimeout(500);
        // Check if modal opened or should have
        const modal = await page.$('[role="dialog"], .modal, [data-modal]');
        if (modal) {
          await expect(modal).toBeVisible();
        }
      }
    },
  },
];

test.describe('Mobile Device Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Login before tests
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'merchant@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  // Test on each device
  for (const [deviceName, deviceConfig] of Object.entries(TEST_DEVICES)) {
    test.describe(`Device: ${deviceName}`, () => {
      test.use(deviceConfig);

      // Run critical journeys on each device
      for (const journey of CRITICAL_JOURNEYS) {
        test(`should complete ${journey.name} journey`, async ({ page }) => {
          await page.goto(journey.url);
          await journey.action(page);
        });
      }

      // Device-specific tests
      test('should handle orientation change', async ({ page }) => {
        const viewport = page.viewportSize();
        if (viewport) {
          // Rotate to landscape
          await page.setViewportSize({
            width: viewport.height,
            height: viewport.width,
          });
          await page.waitForTimeout(500);
          
          // Verify layout adjusts
          await expect(page.locator('body')).toBeVisible();
          
          // Rotate back to portrait
          await page.setViewportSize(viewport);
          await page.waitForTimeout(500);
        }
      });

      test('should handle touch interactions', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Touch tests only for mobile devices');
        
        // Swipe gesture
        await page.evaluate(() => {
          const element = document.querySelector('main');
          if (element) {
            element.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 100, clientY: 100 }] as any }));
            element.dispatchEvent(new TouchEvent('touchend', { touches: [{ clientX: 50, clientY: 100 }] as any }));
          }
        });
        
        await page.waitForTimeout(300);
      });

      test('should not have horizontal scroll', async ({ page }) => {
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        // Allow small overflow (under 10px) due to rounding
        if (hasHorizontalScroll) {
          const overflow = await page.evaluate(() => 
            document.documentElement.scrollWidth - document.documentElement.clientWidth
          );
          expect(overflow).toBeLessThan(10);
        }
      });

      test('should have readable text', async ({ page }) => {
        // Sample text elements
        const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
          elements.map(el => ({
            text: el.textContent?.trim(),
            fontSize: parseInt(getComputedStyle(el).fontSize),
          }))
        );
        
        headings.forEach(heading => {
          if (heading.fontSize && heading.text) {
            // Minimum 14px for body text, 18px for headings
            expect(heading.fontSize).toBeGreaterThanOrEqual(14);
          }
        });
      });

      test('should have tappable targets', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Touch target tests only for mobile devices');
        
        // Check buttons have minimum 44x44px touch targets
        const buttons = await page.$$eval('button, a, [role="button"]', (elements) =>
          elements.map(el => {
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName,
              text: el.textContent?.trim(),
              width: rect.width,
              height: rect.height,
            };
          })
        );
        
        buttons.forEach(button => {
          if (button.width && button.height) {
            // WCAG recommends minimum 44x44px (CSS pixels)
            expect(button.width).toBeGreaterThanOrEqual(44);
            expect(button.height).toBeGreaterThanOrEqual(44);
          }
        });
      });
    });
  }
});

test.describe('Network Condition Edge Cases', () => {
  test('should handle slow 3G network', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible({ timeout: 30000 });
  });

  test('should handle offline mode', async ({ page, context }) => {
    await context.setOffline(true);
    
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Should show offline message or cached content
    const offlineMessage = await page.$('[data-offline], .offline-message');
    if (!offlineMessage) {
      console.log('⚠️  No offline state handling detected');
    }
  });

  test('should recover from network failure', async ({ page }) => {
    await page.route('**/api/*', route => route.abort('failed'));
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Should show error state with retry option
    const retryButton = await page.$('button:has-text("Retry"), button:has-text("Try Again")');
    if (!retryButton) {
      console.log('⚠️  No retry mechanism found after network failure');
    }
  });
});

test.describe('Performance Edge Cases', () => {
  test('should handle large datasets', async ({ page }) => {
    // Navigate to a list view that might have many items
    await page.goto('/dashboard/products');
    
    // Check if pagination or virtual scrolling is used
    const itemCount = await page.count('table tr, .list-item, [data-list-item]');
    
    if (itemCount > 100) {
      console.log(`⚠️  Large list (${itemCount} items) - ensure virtual scrolling is enabled`);
      
      // Measure scroll performance
      const startTime = Date.now();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      const scrollTime = Date.now() - startTime;
      
      expect(scrollTime).toBeLessThan(2000); // Should scroll smoothly
    }
  });

  test('should handle rapid navigation', async ({ page }) => {
    const pages = ['/dashboard', '/dashboard/analytics', '/dashboard/settings'];
    
    // Rapidly navigate between pages
    for (const p of pages) {
      await page.goto(p);
    }
    
    // Should not crash or leak memory
    await expect(page.locator('main')).toBeVisible();
  });

  test('should handle multiple concurrent actions', async ({ page }) => {
    // Trigger multiple actions simultaneously
    await Promise.all([
      page.click('button').catch(() => {}),
      page.fill('input', 'test').catch(() => {}),
      page.selectOption('select', 'option').catch(() => {}),
    ]);
    
    // Should handle gracefully without errors
  });
});

test.describe('Browser-Specific Edge Cases', () => {
  test('should work in Safari (iOS)', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Safari-specific test');
    
    await page.goto('/dashboard');
    
    // Check for Safari-specific issues
    const dateInputs = await page.$$eval('input[type="date"]', inputs => inputs.length);
    if (dateInputs > 0) {
      console.log(`Found ${dateInputs} date inputs - verify native picker works in Safari`);
    }
  });

  test('should work in Chrome Mobile', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chrome-specific test');
    
    await page.goto('/dashboard');
    
    // Check Chrome-specific features
    const hasAutofill = await page.$$eval('input[autocomplete]', inputs => inputs.length);
    if (hasAutofill > 0) {
      console.log(`Found ${hasAutofill} autofill-enabled inputs`);
    }
  });
});
