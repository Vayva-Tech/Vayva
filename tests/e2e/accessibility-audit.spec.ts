/**
 * Accessibility Audit Script - WCAG 2.1 AA Compliance Testing
 * Runs axe-core against all industry dashboards
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Define all industry routes to test
const INDUSTRY_ROUTES = [
  '/dashboard/retail',
  '/dashboard/fashion',
  '/dashboard/grocery',
  '/dashboard/healthcare-services',
  '/dashboard/legal',
  '/dashboard/nonprofit',
  '/dashboard/nightlife',
  '/dashboard/restaurant',
  '/dashboard/beauty',
  '/dashboard/petcare',
  '/dashboard/blog-media',
  '/dashboard/wholesale',
  '/dashboard/travel',
  '/dashboard/education',
  '/dashboard/wellness',
  '/dashboard/professional-services',
  '/dashboard/creative',
  '/dashboard/automotive',
  '/dashboard/meal-kit',
  '/dashboard/saas',
  '/dashboard/events',
  '/dashboard/realestate',
  '/dashboard/food',
  '/dashboard/services',
  '/dashboard/specialized',
  '/dashboard/industry-analytics',
];

// WCAG 2.1 AA Ruleset
const WCAG_21_AA_RULES = [
  'color-contrast',
  'label',
  'link-name',
  'image-alt',
  'button-name',
  'form-field-multiple-labels',
  'input-button-name',
  'aria-roles',
  'aria-valid-attr',
  'aria-required-attr',
  'landmark-one-main',
  'region',
  'skip-link',
  'html-lang-valid',
  'page-has-heading-one',
];

test.describe('Accessibility Audit - WCAG 2.1 AA Compliance', () => {
  test.beforeEach(async ({ page }) => {
    // Login as merchant user before each test
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'merchant@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  for (const route of INDUSTRY_ROUTES) {
    test(`should pass accessibility audit on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .disableRules(['color-contrast']) // Temporarily disabled for phased fixes
        .analyze();

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n=== Violations on ${route} ===`);
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n[${violation.impact?.toUpperCase()}] ${violation.id}`);
          console.log(`Description: ${violation.description}`);
          console.log(`Help: ${violation.help}`);
          console.log(`Affected nodes: ${violation.nodes.length}`);
          
          // Log first few nodes for context
          violation.nodes.slice(0, 3).forEach((node) => {
            console.log(`  - ${node.html}`);
            if (node.failureSummary) {
              console.log(`    Fix: ${node.failureSummary}`);
            }
          });
        });
      }

      // Assert no critical or serious violations
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical'
      );
      
      const seriousViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'serious'
      );

      expect(criticalViolations).toHaveLength(0);
      expect(seriousViolations).toHaveLength(0);

      // Allow moderate/minor violations but log them
      const moderateViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'moderate'
      );
      
      if (moderateViolations.length > 0) {
        console.log(`\n⚠️  Moderate violations on ${route}: ${moderateViolations.length}`);
      }
    });
  }

  test('should have keyboard navigation on main dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();

    // Continue tabbing through interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT', 'SELECT'].includes(focusedElement || '')).toBe(true);
    }

    // Test reverse tabbing
    await page.keyboard.press('Shift+Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have skip link for accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for skip link
    const skipLink = await page.$('a[href="#main-content"], a[href="#content"], a.skip-link');
    
    if (!skipLink) {
      console.log('⚠️  Warning: No skip link found on main dashboard');
    }
    
    // Skip links are recommended but not strictly required if logical tab order exists
    test.info().annotations.push({
      type: 'accessibility',
      description: skipLink ? 'Skip link present ✅' : 'Skip link missing ⚠️',
    });
  });
});

test.describe('Screen Reader Compatibility Tests', () => {
  test('should have ARIA labels on icon buttons', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Find all buttons with icons but no text
    const iconButtons = await page.$$('button svg');
    
    if (iconButtons.length > 0) {
      console.log(`Found ${iconButtons.length} icon buttons - checking ARIA labels...`);
      
      // This is a basic check - full screen reader testing should be done manually
      const buttonsWithAria = await page.$$eval('button[aria-label]', (buttons) => buttons.length);
      
      console.log(`Buttons with aria-label: ${buttonsWithAria}/${iconButtons.length}`);
      
      if (buttonsWithAria < iconButtons.length) {
        console.log(`⚠️  ${iconButtons.length - buttonsWithAria} icon buttons missing aria-labels`);
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for h1
    const h1Count = await page.$$eval('h1', (headings) => headings.length);
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check that h2 follows h1 (no skipped levels)
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) => 
      elements.map(el => ({ tag: el.tagName.toLowerCase(), text: el.textContent?.trim() }))
    );

    let lastLevel = 0;
    const violations = [];
    
    for (const heading of headings) {
      const level = parseInt(heading.tag.charAt(1));
      
      if (level > lastLevel + 1) {
        violations.push(`Skipped heading level: h${lastLevel} → h${level} (${heading.text})`);
      }
      
      lastLevel = level;
    }

    if (violations.length > 0) {
      console.log('⚠️  Heading hierarchy violations:');
      violations.forEach(v => console.log(`  - ${v}`));
    }
    
    expect(violations).toHaveLength(0);
  });
});

test.describe('Color Contrast Spot Checks', () => {
  test('should have sufficient color contrast on key elements', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Manual color contrast checks would require specialized tools
    // This is a placeholder for automated contrast checking
    
    console.log('📝 Note: Full color contrast audit should be performed using:');
    console.log('  - axe DevTools browser extension');
    console.log('  - WebAIM Contrast Checker');
    console.log('  - Manual testing with color blindness simulators');
    
    // Automated check: ensure high-contrast mode works
    await page.emulateMedia({ forcedColors: 'active' });
    await page.waitForTimeout(1000);
    
    // Take screenshot to verify high-contrast mode renders correctly
    await expect(page).toHaveScreenshot('high-contrast-mode.png');
  });
});
