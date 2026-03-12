import { test, expect } from '@playwright/test';

test.describe('Retail Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/retail');
  });

  test('should load retail dashboard successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Retail/);
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should display inventory management system', async ({ page }) => {
    const inventoryManagement = page.locator('[data-testid="inventory-management"]');
    await expect(inventoryManagement).toBeVisible();
    
    // Check product listings
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-count"]')).toBeVisible();
  });

  test('should add new product to inventory', async ({ page }) => {
    await page.click('[data-testid="add-product"]');
    
    await page.fill('[name="productName"]', 'Test Product');
    await page.fill('[name="sku"]', 'TEST-SKU-001');
    await page.fill('[name="price"]', '29.99');
    await page.fill('[name="quantity"]', '100');
    
    await page.click('[data-testid="save-product"]');
    await expect(page.locator('[data-testid="product-saved-success"]')).toBeVisible({ timeout: 5000 });
  });

  test('should process point of sale transaction', async ({ page }) => {
    const posSystem = page.locator('[data-testid="pos-system"]');
    await expect(posSystem).toBeVisible();
    
    // Scan product
    await page.fill('[data-testid="barcode-scanner"]', 'TEST-SKU-001');
    await expect(page.locator('[data-testid="cart-items"]')).toContainText('Test Product');
    
    // Process payment
    await page.click('[data-testid="checkout"]');
    await page.click('[data-testid="payment-method-cash"]');
    await page.click('[data-testid="complete-sale"]');
    
    await expect(page.locator('[data-testid="receipt-generated"]')).toBeVisible({ timeout: 5000 });
  });

  test('should display customer information and loyalty program', async ({ page }) => {
    const crmSection = page.locator('[data-testid="crm-section"]');
    await expect(crmSection).toBeVisible();
    
    // Search for customer
    await page.fill('[data-testid="customer-search"]', 'test@example.com');
    await expect(page.locator('[data-testid="customer-profile"]')).toBeVisible();
    
    // Check loyalty points
    await expect(page.locator('[data-testid="loyalty-points"]')).toBeVisible();
  });

  test('should generate sales reports', async ({ page }) => {
    const salesReports = page.locator('[data-testid="sales-reports"]');
    await expect(salesReports).toBeVisible();
    
    // Select date range
    await page.fill('[data-testid="report-start-date"]', '2024-01-01');
    await page.fill('[data-testid="report-end-date"]', '2024-12-31');
    
    // Generate report
    await page.click('[data-testid="generate-report"]');
    await expect(page.locator('[data-testid="report-results"]')).toBeVisible({ timeout: 5000 });
  });

  test('should manage omnichannel orders', async ({ page }) => {
    const omnichannelOrders = page.locator('[data-testid="omnichannel-orders"]');
    await expect(omnichannelOrders).toBeVisible();
    
    // Check online orders
    await expect(page.locator('[data-testid="online-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="in-store-pickup"]')).toBeVisible();
  });
});
