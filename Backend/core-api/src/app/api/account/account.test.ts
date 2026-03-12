import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getOverview } from "./overview/route";
import { GET as getDomains } from "./domains/route";
import { POST as verifyDomain } from "./domains/verify/route";
import { POST as changePassword } from "./security/change-password/route";
import { PATCH as patchGovernance } from "./governance/route";
import { requireAuth } from "@/lib/session.server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

const mockUpdateExportStatus = vi.fn();
const mockUpdateDeletionStatus = vi.fn();
const testStoreId = "store_test_999";
const testUserId = "user_test_999";
const testSession = { id: testUserId, storeId: testStoreId };
// Global Mocks
vi.mock("@/lib/session.server", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@vayva/ai-agent", () => ({
  DataGovernanceService: {
    updateExportStatus: (...args: unknown[]) => mockUpdateExportStatus(...args),
    updateDeletionStatus: (...args: unknown[]) =>
      mockUpdateDeletionStatus(...args),
  },
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
    mockUpdateExportStatus.mockResolvedValue({ success: true });
    mockUpdateDeletionStatus.mockResolvedValue({ success: true });
  });
  describe("GET /api/account/overview", () => {
    it("enforces tenant isolation", async () => {
      prisma.store.findUnique.mockResolvedValue({
        id: testStoreId,
        name: "Isolated Store",
      });
      prisma.auditLog.findMany.mockResolvedValue([]);
      await getOverview();
      expect(prisma.store.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: testStoreId },
        }),
      );
    });
  });
  describe("GET /api/account/domains", () => {
    it("returns verification tokens and status", async () => {
      prisma.domainMapping.findFirst.mockResolvedValue({
        id: "dm1",
        domain: "custom.com",
        status: "pending",
        verificationToken: "v-token-123",
        provider: { lastError: "DNS mismatch" },
      });
      const res = await getDomains();
      const json = await res.json();
      expect(json.customDomain).toBe("custom.com");
      expect(json.verificationToken).toBe("v-token-123");
      expect(json.lastError).toBe("DNS mismatch");
    });
  });
  describe("POST /api/account/domains/verify", () => {
    it("starts verification only for owner store", async () => {
      prisma.domainMapping.findUnique.mockResolvedValue({
        id: "dm1",
        storeId: "OTHER_STORE",
        domain: "hacker.com",
      });
      const res = await verifyDomain(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify({ domainMappingId: "dm1" }),
        }),
      );
      expect(res.status).toBe(404); // Not found or unauthorized
    });
    it("triggers verification for valid ownership", async () => {
      prisma.domainMapping.findUnique.mockResolvedValue({
        id: "dm1",
        storeId: testStoreId,
        domain: "valid.shop",
      });
      const res = await verifyDomain(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify({ domainMappingId: "dm1" }),
        }),
      );
      expect(res.status).toBe(200);
      expect(prisma.domainMapping.update).toHaveBeenCalled();
    });
  });
  describe("POST /api/account/security/change-password", () => {
    it("validates current password before updating", async () => {
      const oldHash = await bcrypt.hash("old-password", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        password: oldHash,
        email: "test@vayva.ng",
      });
      const res = await changePassword(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "wrong-password",
            newPassword: "new-password123",
            confirmPassword: "new-password123",
          }),
        }),
      );
      expect(res.status).toBe(401);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
    it("updates password and logs audit on success", async () => {
      const oldHash = await bcrypt.hash("old-password", 10);
      prisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        password: oldHash,
        email: "test@vayva.ng",
      });
      const res = await changePassword(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify({
            currentPassword: "old-password",
            newPassword: "secure-password-99",
            confirmPassword: "secure-password-99",
          }),
        }),
      );
      expect(res.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe("PATCH /api/account/governance", () => {
    it("rejects invalid requestType", async () => {
      const res = await patchGovernance(
        new Request("http://localhost", {
          method: "PATCH",
          body: JSON.stringify({ requestType: "invalid", requestId: "r1", status: "PENDING" }),
        }),
      );

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("requestType");
    });

    it("delegates valid export transitions", async () => {
      const res = await patchGovernance(
        new Request("http://localhost", {
          method: "PATCH",
          body: JSON.stringify({
            requestType: "export",
            requestId: "exp-1",
            status: "RUNNING",
          }),
        }),
      );

      expect(res.status).toBe(200);
      expect(mockUpdateExportStatus).toHaveBeenCalledWith(
        "exp-1",
        "RUNNING",
        undefined,
      );
    });

    it("maps invalid transition errors to 422", async () => {
      mockUpdateDeletionStatus.mockResolvedValueOnce({
        success: false,
        error: "Invalid deletion status transition: REJECTED -> APPROVED",
      });

      const res = await patchGovernance(
        new Request("http://localhost", {
          method: "PATCH",
          body: JSON.stringify({
            requestType: "deletion",
            requestId: "del-1",
            status: "APPROVED",
          }),
        }),
      );

      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.error).toContain("Invalid deletion status transition");
    });
  });
});
