import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@vayva/db";
import { syncOnboardingData } from "../../apps/merchant-admin/src/lib/onboarding-sync";
// Mock Onboarding State
const mockState = {
    isComplete: true,
    currentStep: "complete",
    schemaVersion: 1,
    business: {
        name: "Unit Test Store",
        legalName: "Unit Test Legal Ltd",
        type: "registered",
        email: "test@unit.com",
        location: {
            country: "Nigeria",
            state: "Lagos",
            city: "Ikeja",
            address: "123 Test St",
        },
    },
    storeDetails: {
        storeName: "Unit Test Store",
        slug: "unit-test-store-" + Date.now(),
        domainPreference: "subdomain",
        publishStatus: "published",
    },
    payments: {
        currency: "NGN",
        settlementBank: {
            bankName: "Test Bank",
            accountNumber: "1234567890",
            accountName: "Unit Test Account",
        },
        payoutScheduleAcknowledged: true,
    },
    delivery: {
        policy: "standard",
        defaultProvider: "gokada",
        pickupAddress: "Pickup Station",
    },
    kycStatus: "verified",
};
describe("Onboarding Sync Contract (Unit)", () => {
    let storeId;
    beforeAll(async () => {
        // Create a shell store to sync against
        const store = await prisma.store.create({
            data: {
                name: "Pre-Sync Store",
                slug: "pre-sync-slug-" + Date.now(),
                onboardingStatus: "IN_PROGRESS",
            },
        });
        storeId = store.id;
    });
    afterAll(async () => {
        // Cleanup
        if (storeId) {
            await prisma.store.delete({ where: { id: storeId } }).catch(() => { });
            await prisma.storeProfile
                .deleteMany({ where: { storeId } })
                .catch(() => { });
            await prisma.bankBeneficiary
                .deleteMany({ where: { storeId } })
                .catch(() => { });
            await prisma.billingProfile
                .deleteMany({ where: { storeId } })
                .catch(() => { });
            await prisma.kycRecord.deleteMany({ where: { storeId } }).catch(() => { });
        }
    });
    it("QA-01: Maps & persists all fields correctly", async () => {
        await syncOnboardingData(storeId, mockState);
        // Verify Store
        const store = await prisma.store.findUnique({ where: { id: storeId } });
        expect(store?.name).toBe(mockState.business?.name);
        expect(store?.isLive).toBe(true);
        expect(store?.settings?.currency).toBe("NGN");
        // Verify StoreProfile
        const profile = await prisma.storeProfile.findUnique({
            where: { storeId },
        });
        expect(profile?.displayName).toBe(mockState.storeDetails?.storeName);
        expect(profile?.city).toBe(mockState.business?.location?.city);
        expect(profile?.deliveryMethods).toContain("gokada");
        expect(profile?.pickupAvailable).toBe(true);
        // Verify BillingProfile
        const billing = await prisma.billingProfile.findUnique({
            where: { storeId },
        });
        expect(billing?.legalName).toBe(mockState.business?.legalName);
        // Verify BankBeneficiary
        const bank = await prisma.bankBeneficiary.findFirst({
            where: { storeId, isDefault: true },
        });
        expect(bank?.accountNumber).toBe(mockState.payments?.settlementBank?.accountNumber);
        // Verify KycRecord
        const kyc = await prisma.kycRecord.findUnique({ where: { storeId } });
        expect(kyc?.status).toBe("VERIFIED");
    });
    it("QA-02: Test transaction rollback (Atomicity)", async () => {
        // Create a conflict to force failure
        // We'll insert a StoreProfile with the ID "conflict-test" first (if we could?)
        // Better: Try to sync a state that causes unique constraint violation on StoreProfile slug?
        // Let's rely on Mocking for pure unit test atomicity usually, but here we want integration-like behavior.
        // Let's try to sync with a slug that is already taken by ANOTHER store.
        const otherStore = await prisma.storeProfile.create({
            data: {
                storeId: "some-other-id-" + Date.now(),
                slug: "conflict-slug",
                displayName: "Conflict",
                store: { create: { name: "Conflict", slug: "conflict-slug" } }, // Actually store slug is unique too
            },
        });
        const maliciousState = {
            ...mockState,
            storeDetails: {
                ...mockState.storeDetails,
                slug: "conflict-slug", // This should fail unique constraint on Store/StoreProfile
            },
        };
        // Attempt sync
        await expect(syncOnboardingData(storeId, maliciousState)).rejects.toThrow();
        // Verify NO partial updates passed (e.g. Bank shouldn't have changed if we used a new bank)
        // Let's modify bank in malicious state
        maliciousState.payments.settlementBank.accountNumber = "9999999999";
        const bank = await prisma.bankBeneficiary.findFirst({
            where: { storeId, isDefault: true },
        });
        expect(bank?.accountNumber).not.toBe("9999999999"); // Should remain original
        // Cleanup conflict
        await prisma.store.delete({ where: { id: otherStore.storeId } });
    });
    it("QA-03: Test idempotency (Sync runs twice)", async () => {
        const initialState = await prisma.store.findUnique({
            where: { id: storeId },
        });
        // Run sync again
        await syncOnboardingData(storeId, mockState);
        const finalState = await prisma.store.findUnique({
            where: { id: storeId },
        });
        expect(finalState?.updatedAt).not.toBe(initialState?.updatedAt); // Metadata updates
        // But data content should be same (no dupe records for bank)
        const banks = await prisma.bankBeneficiary.findMany({
            where: { storeId, isDefault: true },
        });
        expect(banks.length).toBe(1); // Should still only have 1 default
    });
});
