import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getOverview } from "./overview/route";
import { GET as getDomains, } from "./domains/route";
import { POST as verifyDomain } from "./domains/verify/route";
import { POST as changePassword } from "./security/change-password/route";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
const testStoreId = "store_test_999";
const testUserId = "user_test_999";
const testSession = { 
    user: { 
        id: testUserId, 
        storeId: testStoreId, 
        email: "test@vayva.ng", 
        name: "Test User", 
        emailVerified: true,
        storeName: "Test Store",
        role: "OWNER",
        plan: "PRO",
        trialEndsAt: null,
        onboardingCompleted: true
    }, 
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
};
// Global Mocks
vi.mock("@/lib/auth/session", () => ({
    requireAuth: vi.fn(),
}));
vi.mock("@/lib/audit", () => ({
    logAudit: vi.fn(),
    AuditAction: { PASSWORD_CHANGED: "PASSWORD_CHANGED" },
}));
vi.mock("@/lib/rate-limit", () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
}));
// Mocks
vi.mock("@/lib/email/resend", () => ({
    ResendEmailService: {
        sendPasswordChangedEmail: vi.fn().mockResolvedValue({ success: true }),
        assertConfigured: vi.fn(),
    },
}));
vi.mock("@vayva/db", () => ({
    prisma: {
        account: { findUnique: vi.fn() },
        store: { findUnique: vi.fn(), update: vi.fn() },
        bankBeneficiary: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            findUnique: vi.fn(),
        },
        domainMapping: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
        auditLog: { findMany: vi.fn(), create: vi.fn() },
        kycRecord: { findUnique: vi.fn() },
        aiSubscription: { findUnique: vi.fn() },
        whatsappChannel: { findUnique: vi.fn() },
        securitySetting: { findUnique: vi.fn() },
        user: { findUnique: vi.fn(), update: vi.fn() },
    },
}));
describe("Expanded Account API Suite", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(requireAuth).mockResolvedValue(testSession);
    });
    describe("GET /api/account/overview", () => {
        it("enforces tenant isolation", async () => {
            ((prisma as any)?.store?.findUnique as any).mockResolvedValue({
                id: testStoreId,
                name: "Isolated Store",
            });
            ((prisma as any)?.auditLog?.findMany as any).mockResolvedValue([]);
            await getOverview(new NextRequest("http://localhost/api/account/overview") as any);
            expect((prisma as any)?.store?.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: testStoreId },
            }));
        });
    });
    describe("GET /api/account/domains", () => {
        it("returns verification tokens and status", async () => {
            ((prisma as any)?.domainMapping?.findFirst as any).mockResolvedValue({
                id: "dm1",
                domain: "custom.com",
                status: "pending",
                verificationToken: "v-token-123",
                provider: { lastError: "DNS mismatch" },
            });
            const res = await getDomains(new NextRequest("http://localhost/api/account/domains") as any);
            const json = await res.json();
            expect(json.customDomain).toBe("custom.com");
            expect(json.verificationToken).toBe("v-token-123");
            expect(json.lastError).toBe("DNS mismatch");
        });
    });
    describe("POST /api/account/domains/verify", () => {
        it("starts verification only for owner store", async () => {
            ((prisma as any)?.domainMapping?.findUnique as any).mockResolvedValue({
                id: "dm1",
                storeId: "OTHER_STORE",
                domain: "hacker.com",
            });
            const res = await verifyDomain(new Request("http://localhost", {
                method: "POST",
                body: JSON.stringify({ domainMappingId: "dm1" }),
            }) as any);
            expect((res as any).status).toBe(404); // Not found or unauthorized
        });
        it("triggers verification for valid ownership", async () => {
            ((prisma as any)?.domainMapping?.findUnique as any).mockResolvedValue({
                id: "dm1",
                storeId: testStoreId,
                domain: "valid.shop",
            });
            const res = await verifyDomain(new Request("http://localhost", {
                method: "POST",
                body: JSON.stringify({ domainMappingId: "dm1" }),
            }) as any);
            expect((res as any).status).toBe(200);
            expect((prisma as any)?.domainMapping?.update).toHaveBeenCalled();
        });
    });
    describe("POST /api/account/security/change-password", () => {
        it("validates current password before updating", async () => {
            const oldHash = await bcrypt.hash("old-password", 10);
            ((prisma as any)?.user?.findUnique as any).mockResolvedValue({
                id: testUserId,
                password: oldHash,
                email: "test@vayva.ng",
            });
            const res = await changePassword(new Request("http://localhost", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword: "wrong-password",
                    newPassword: "new-password123",
                    confirmPassword: "new-password123",
                }),
            }) as any);
            expect((res as any).status).toBe(401);
            expect((prisma as any)?.user?.update).not.toHaveBeenCalled();
        });
        it("updates password and logs audit on success", async () => {
            const oldHash = await bcrypt.hash("old-password", 10);
            ((prisma as any)?.user?.findUnique as any).mockResolvedValue({
                id: testUserId,
                password: oldHash,
                email: "test@vayva.ng",
            });
            const res = await changePassword(new Request("http://localhost", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword: "old-password",
                    newPassword: "secure-password-99",
                    confirmPassword: "secure-password-99",
                }),
            }) as any);
            expect((res as any).status).toBe(200);
            expect((prisma as any)?.user?.update).toHaveBeenCalled();
        });
    });
});
