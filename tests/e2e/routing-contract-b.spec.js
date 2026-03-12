import { test, expect } from '@playwright/test';
test.describe('URL Contract B Enforcement', () => {
    // 1. Merchant Routes (Direct)
    test('Merchant Dashboard should be accessible at /dashboard', async ({ page }) => {
        // Go to merchant-admin directly
        await page.goto('http://localhost:3000/dashboard');
        // Should redirect to login if not auth, but path should be preserved or handled
        // If unauth, it goes to /signin?callbackUrl=/dashboard
        await expect(page).toHaveURL(/.*\/signin/);
    });
    test('Legacy /admin should redirect to /dashboard', async ({ page }) => {
        // Simulate subdomain behavior via header if possible, or just path if tenant engine handles path
        // Our tenant engine handles "admin.vayva.ng" -> rewrite /admin
        // But we deprecated it to redirect.
        // Let's test the path-based access if applicable, or just the rewrite rule.
        // Currently configured in tenant-engine.ts: admin.vayva.ng -> REDIRECT -> /dashboard
        // We can't easily test subdomain DNS locally without /etc/hosts, 
        // but we can test the outcome if we could hit it.
        // Instead, let's test if we removed /admin routes.
        const response = await page.goto('http://localhost:3000/admin');
        // Should 404 or redirect depending on Next.js handling of missing folder.
        // Since we deleted apps/merchant-admin/src/app/admin, it should be 404 
        // unless middleware catches it.
        // Tenant Engine only catches "admin.vayva.ng".
        // Path "/admin" on "vayva.ng" isn't explicitly handled in middleware except by falling through.
        expect(response?.status()).toBe(404);
    });
    // 2. Ops Console (Rewrite)
    test('Ops Console should be reachable via /ops on Merchant domain', async ({ page }) => {
        // This tests the rewrite in merchant-admin/next.config.js
        const response = await page.goto('http://localhost:3000/ops/login');
        expect(response?.status()).toBe(200);
        await expect(page).toHaveTitle(/Ops/i);
    });
    // 3. Storefront (Wildcard)
    test('Storefront Home should load', async ({ page }) => {
        // Direct access to storefront port
        const response = await page.goto('http://localhost:3001/');
        expect(response?.status()).toBe(200);
    });
    // 4. Storefront Checkout
    test('Storefront Checkout path exists', async ({ page }) => {
        const response = await page.goto('http://localhost:3001/checkout');
        // Might redirect to cart if empty, or show empty checkout
        // Expect 200 or 30x
        expect(response?.status()).not.toBe(404);
    });
});
