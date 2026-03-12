import { test, expect } from '@playwright/test';

test.describe('Food Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/food');
  });

  test('should load food dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Food/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should display recipe costing tool', async ({ page }) => {
    const recipeCosting = page.locator('[data-testid="recipe-costing"]');
    await expect(recipeCosting).toBeVisible();
    
    // Check ingredient list
    await expect(page.locator('[data-testid="ingredients-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-cost-display"]')).toBeVisible();
  });

  test('should calculate recipe costs', async ({ page }) => {
    await page.click('[data-testid="new-recipe"]');
    
    await page.fill('[name="recipeName"]', 'Test Recipe');
    await page.fill('[name="servings"]', '4');
    
    // Add ingredient
    await page.click('[data-testid="add-ingredient"]');
    await page.fill('[data-testid="ingredient-name"]:first-child', 'Flour');
    await page.fill('[data-testid="ingredient-quantity"]:first-child', '2');
    await page.fill('[data-testid="ingredient-unit"]:first-child', 'cups');
    await page.fill('[data-testid="ingredient-cost"]:first-child', '1.50');
    
    await page.click('[data-testid="calculate-cost"]');
    await expect(page.locator('[data-testid="cost-per-serving"]')).toBeVisible({ timeout: 3000 });
  });

  test('should display menu engineering analytics', async ({ page }) => {
    const menuEngineering = page.locator('[data-testid="menu-engineering"]');
    await expect(menuEngineering).toBeVisible();
    
    // Check menu matrix
    await expect(page.locator('[data-testid="menu-matrix-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="star-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="dog-items"]')).toBeVisible();
  });

  test('should manage kitchen operations', async ({ page }) => {
    const kitchenOps = page.locator('[data-testid="kitchen-operations"]');
    await expect(kitchenOps).toBeVisible();
    
    // Check order queue
    await expect(page.locator('[data-testid="order-queue"]')).toBeVisible();
    await expect(page.locator('[data-testid="prep-timers"]')).toBeVisible();
  });

  test('should update order status in kitchen display', async ({ page }) => {
    const firstOrder = page.locator('[data-testid="order-card"]:first-child');
    await expect(firstOrder).toBeVisible();
    
    // Mark as started
    await page.click('[data-testid="start-order"]');
    await expect(page.locator('[data-testid="order-status-preparing"]')).toBeVisible({ timeout: 3000 });
    
    // Mark as complete
    await page.click('[data-testid="complete-order"]');
    await expect(page.locator('[data-testid="order-status-ready"]')).toBeVisible({ timeout: 3000 });
  });

  test('should track inventory levels', async ({ page }) => {
    const inventoryTracking = page.locator('[data-testid="inventory-tracking"]');
    await expect(inventoryTracking).toBeVisible();
    
    // Check stock levels
    await expect(page.locator('[data-testid="current-stock"]')).toBeVisible();
    await expect(page.locator('[data-testid="par-levels"]')).toBeVisible();
    await expect(page.locator('[data-testid="reorder-alerts"]')).toBeVisible();
  });

  test('should generate purchase orders', async ({ page }) => {
    await page.click('[data-testid="create-purchase-order"]');
    
    // Select supplier
    await page.selectOption('[name="supplier"]', 'primary-supplier');
    
    // Add items to order
    await page.click('[data-testid="add-to-order"]');
    await page.fill('[data-testid="order-quantity"]', '50');
    
    await page.click('[data-testid="submit-purchase-order"]');
    await expect(page.locator('[data-testid="purchase-order-created"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display food cost percentage metrics', async ({ page }) => {
    const foodCostMetrics = page.locator('[data-testid="food-cost-metrics"]');
    await expect(foodCostMetrics).toBeVisible();
    
    // Check key metrics
    await expect(page.locator('[data-testid="actual-food-cost"]')).toBeVisible();
    await expect(page.locator('[data-testid="target-food-cost"]')).toBeVisible();
    await expect(page.locator('[data-testid="variance-analysis"]')).toBeVisible();
  });
});
