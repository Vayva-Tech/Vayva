import { test, expect } from "@playwright/test";
import { Repository } from "../../apps/merchant-admin/src/lib/db/repo";
import { StorageService } from "../../apps/merchant-admin/src/lib/storage/storageService";
import { prisma } from "@vayva/db";
test.describe("No Data Leak Suite", () => {
    // Mock Contexts
    const ctxA = {
        userId: "u1",
        merchantId: "merch_isolate_A",
        roles: [],
    };
    const ctxB = {
        userId: "u2",
        merchantId: "merch_isolate_B",
        roles: [],
    };
    test.beforeAll(async () => {
        // Cleanup & Seed
        await prisma.inventoryItem.deleteMany({
            where: { merchantId: { in: [ctxA.merchantId, ctxB.merchantId] } },
        });
        // Seed A's Item
        await prisma.inventoryItem.create({
            data: { merchantId: ctxA.merchantId, productId: "prod_A", onHand: 10 },
        });
        // Seed B's Item
        await prisma.inventoryItem.create({
            data: { merchantId: ctxB.merchantId, productId: "prod_B", onHand: 50 },
        });
    });
    test("DB Isolation: Merchant A cannot see Merchant B data", async () => {
        // A reads
        const itemsA = await Repository.products.findMany(ctxA);
        expect(itemsA.length).toBe(1);
        expect(itemsA[0].productId).toBe("prod_A");
        // B reads
        const itemsB = await Repository.products.findMany(ctxB);
        expect(itemsB.length).toBe(1);
        expect(itemsB[0].productId).toBe("prod_B");
    });
    test("DB Isolation: Merchant A cannot read B item by ID", async () => {
        const bItem = await prisma.inventoryItem.findFirst({
            where: { productId: "prod_B" },
        });
        // Direct Repo Access with A's Context
        const result = await Repository.products.findUnique(ctxA, bItem.id);
        expect(result).toBeNull(); // Should be null because filter includes merchantId: A
    });
    test("Storage Isolation: Merchant A cannot sign B keys", async () => {
        const keyB = `merchants/${ctxB.merchantId}/secret_file.pdf`;
        // A tries to sign B's key
        await expect(StorageService.generateSignedUrl(ctxA, keyB)).rejects.toThrow("Access Denied");
    });
    // API Isolation test would rely on spinning up full app,
    // but repo/service tests cover the logic used by API which is sufficiently rigorous for V1.
});
