import { test as base, expect } from "@playwright/test";
import { prisma } from "@vayva/db";
// Test merchant ID used across all tests
export const TEST_MERCHANT_ID = "123e4567-e89b-12d3-a456-426614174000";
export const TEST_USER_ID = "223e4567-e89b-12d3-a456-426614174000";
// Extend base test with fixtures
export const test = base.extend({
// Add any custom fixtures here if needed
});
export { expect };
// Global setup - runs once before all tests
test.beforeAll(async () => {
    console.log("[E2E Setup] Seeding test data...");
    try {
        // Create test user
        await prisma.user.upsert({
            where: { id: TEST_USER_ID },
            update: {},
            create: {
                id: TEST_USER_ID,
                email: "test@merchant.com",
                password: "$2a$10$dummyhashedpassword", // bcrypt hash of 'password123'
                firstName: "Test",
                lastName: "Merchant Owner",
                isEmailVerified: true,
                isPhoneVerified: false,
            },
        });
        // Create test store (merchant)
        await prisma.store.upsert({
            where: { id: TEST_MERCHANT_ID },
            update: {},
            create: {
                id: TEST_MERCHANT_ID,
                name: "Test Store",
                slug: "test-store-e2e",
                onboardingStatus: "IN_PROGRESS",
                plan: "STARTER",
                category: "general",
            },
        });
        // Create membership linking user to store
        await prisma.membership.upsert({
            where: {
                userId_storeId: {
                    userId: TEST_USER_ID,
                    storeId: TEST_MERCHANT_ID,
                },
            },
            update: {},
            create: {
                userId: TEST_USER_ID,
                storeId: TEST_MERCHANT_ID,
                role: "owner",
            },
        });
        console.log("[E2E Setup] Test data seeded successfully");
    }
    catch (error) {
        console.error("[E2E Setup] Failed to seed test data:", error);
        throw error;
    }
});
// Global teardown - runs once after all tests
test.afterAll(async () => {
    console.log("[E2E Setup] Cleaning up test data...");
    try {
        // Clean up in reverse order of creation (respecting foreign keys)
        await prisma.communicationConsent.deleteMany({
            where: { merchantId: TEST_MERCHANT_ID },
        });
        await prisma.membership.deleteMany({
            where: { storeId: TEST_MERCHANT_ID },
        });
        await prisma.store.deleteMany({
            where: { id: TEST_MERCHANT_ID },
        });
        await prisma.user.deleteMany({
            where: { id: TEST_USER_ID },
        });
        await prisma.$disconnect();
        console.log("[E2E Setup] Cleanup complete");
    }
    catch (error) {
        console.error("[E2E Setup] Cleanup failed:", error);
        await prisma.$disconnect();
    }
});
