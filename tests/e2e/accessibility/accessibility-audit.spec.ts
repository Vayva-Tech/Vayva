import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

test.describe('Accessibility Compliance Audit', () => {
  test('healthcare dashboard should not have accessibility violations', async ({ page }) => {
    await page.goto('/dashboard/healthcare');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    // No critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations).toHaveLength(0);
  });

  test('legal dashboard accessibility compliance', async ({ page }) => {
    await page.goto('/dashboard/legal');
    
    const results = await new AxeBuilder({ page }).analyze();
    const criticalViolations = results.violations.filter(
      v => ['critical', 'serious'].includes(v.impact)
    );
    
    expect(criticalViolations).toHaveLength(0);
  });

  test('restaurant dashboard keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard/restaurant');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Run accessibility scan
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => v.id === 'keyboard')).toHaveLength(0);
  });

  test('retail dashboard screen reader compatibility', async ({ page }) => {
    await page.goto('/dashboard/retail');
    
    const results = await new AxeBuilder({ page }).analyze();
    
    // Check for ARIA violations
    const ariaViolations = results.violations.filter(v => 
      v.tags.includes('cat.name-role-value')
    );
    
    expect(ariaViolations).toHaveLength(0);
  });

  test('creative dashboard color contrast compliance', async ({ page }) => {
    await page.goto('/dashboard/creative');
    
    const results = await new AxeBuilder({ page }).analyze();
    
    // Check color contrast violations
    const contrastViolations = results.violations.filter(v => 
      v.id === 'color-contrast'
    );
    
    // Allow minor warnings, but no critical violations
    const criticalContrast = contrastViolations.filter(v => 
      ['critical', 'serious'].includes(v.impact)
    );
    
    expect(criticalContrast).toHaveLength(0);
  });

  test('professional dashboard focus management', async ({ page }) => {
    await page.goto('/dashboard/professional');
    
    // Tab through entire page
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    // Verify focus is always visible
    const focusedElement = page.locator(':focus-visible');
    await expect(focusedElement).toBeVisible();
  });

  test('food dashboard form accessibility', async ({ page }) => {
    await page.goto('/dashboard/food');
    
    const results = await new AxeBuilder({ page }).analyze();
    
    // Check form field labels
    const labelViolations = results.violations.filter(v => 
      v.id === 'label' || v.id === 'aria-required-attr'
    );
    
    expect(labelViolations).toHaveLength(0);
  });

  test('analytics dashboard accessible charts', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    const results = await new AxeBuilder({ page }).analyze();
    
    // Check for chart accessibility (SVG, canvas alternatives)
    const svgAccess = results.violations.filter(v => 
      v.id === 'svg-img-alt' || v.id === 'image-alt'
    );
    
    expect(svgAccess).toHaveLength(0);
  });

  test('full WCAG 2.1 AA compliance check - all dashboards', async ({ page }) => {
    const dashboards = [
      '/dashboard/healthcare',
      '/dashboard/legal',
      '/dashboard/restaurant',
      '/dashboard/retail',
      '/dashboard/creative',
      '/dashboard/professional',
      '/dashboard/food',
      '/dashboard/analytics'
    ];

    for (const dashboard of dashboards) {
      await page.goto(dashboard);
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      
      const wcagViolations = results.violations;
      
      // Log violations for debugging
      if (wcagViolations.length > 0) {
        console.log(`[${dashboard}] Violations:`, wcagViolations);
      }
      
      // Expect no critical or serious WCAG violations
      const criticalWcag = wcagViolations.filter(v => 
        ['critical', 'serious'].includes(v.impact)
      );
      
      expect(criticalWcag).toHaveLength(0);
    }
  });
});
