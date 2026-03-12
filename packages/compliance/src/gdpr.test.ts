import { describe, it, expect, vi, beforeEach } from "vitest";
import { GdprAutomation, StorageProvider, WhatsAppNotifier, StoreOwnerProvider } from "./gdpr";

// Mock prisma
vi.mock("@vayva/db", () => ({
  prisma: {
    store: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    customer: {
      updateMany: vi.fn(),
    },
    conversation: {
      deleteMany: vi.fn(),
    },
    order: {
      updateMany: vi.fn(),
    },
    accountDeletionRequest: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    // consentRecord is accessed via type assertion in the actual code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminAuditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      store: { update: vi.fn() },
      customer: { updateMany: vi.fn() },
      conversation: { deleteMany: vi.fn() },
      order: { updateMany: vi.fn() },
      accountDeletionRequest: { updateMany: vi.fn() },
    })),
  },
}));

import { prisma } from "@vayva/db";

// Mock implementations
class MockStorageProvider implements StorageProvider {
  async upload(data: Buffer | string, path: string): Promise<string> {
    return `https://storage.test/${path}`;
  }

  async getSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    return `https://storage.test/${path}?expires=${expiresInSeconds}`;
  }
}

class MockWhatsAppNotifier implements WhatsAppNotifier {
  messages: Array<{ instanceName: string; phone: string; text: string }> = [];

  async sendMessage(instanceName: string, phone: string, text: string): Promise<unknown> {
    this.messages.push({ instanceName, phone, text });
    return { success: true };
  }
}

class MockStoreOwnerProvider implements StoreOwnerProvider {
  async getOwnerInfo(_storeId: string) {
    return {
      userId: "user-123",
      email: "owner@test.com",
      phone: "+2341234567890",
      firstName: "John",
      lastName: "Doe",
    };
  }
}

describe("GdprAutomation", () => {
  let gdpr: GdprAutomation;
  let storage: MockStorageProvider;
  let whatsapp: MockWhatsAppNotifier;
  let ownerProvider: MockStoreOwnerProvider;

  beforeEach(() => {
    storage = new MockStorageProvider();
    whatsapp = new MockWhatsAppNotifier();
    ownerProvider = new MockStoreOwnerProvider();
    gdpr = new GdprAutomation(storage, whatsapp, "vayva-official", ownerProvider);
    vi.clearAllMocks();
  });

  describe("handleDataExportRequest", () => {
    it("should export merchant data successfully", async () => {
      const mockMerchant = {
        id: "store-123",
        name: "Test Store",
        createdAt: new Date("2024-01-01"),
        products: [
          { name: "Product 1", price: 1000, createdAt: new Date("2024-01-15") },
        ],
        orders: [
          { orderNumber: "ORD-001", total: 5000, status: "COMPLETED", createdAt: new Date("2024-02-01"), items: [] },
        ],
        customers: [
          { name: "Customer 1", phone: "+2349876543210", email: "customer@test.com" },
        ],
        conversations: [
          { customerPhone: "+2349876543210", messages: [{ id: "msg-1" }] },
        ],
      };

      (prisma.store.findUnique as any).mockResolvedValue(mockMerchant);
      (prisma.adminAuditLog.create as any).mockResolvedValue({});

      const result = await gdpr.handleDataExportRequest("store-123");

      expect(result.merchantId).toBe("store-123");
      expect(result.products).toHaveLength(1);
      expect(result.orders).toHaveLength(1);
      expect(result.customers).toHaveLength(1);
      expect(result.conversations).toHaveLength(1);
      expect(whatsapp.messages).toHaveLength(1);
      expect(whatsapp.messages[0].phone).toBe("+2341234567890");
    });

    it("should throw error if merchant not found", async () => {
      (prisma.store.findUnique as any).mockResolvedValue(null);

      await expect(gdpr.handleDataExportRequest("non-existent")).rejects.toThrow("Merchant not found");
    });
  });

  describe("handleDeletionRequest", () => {
    it("should schedule deletion with 30-day grace period", async () => {
      const mockMerchant = {
        id: "store-123",
        name: "Test Store",
      };

      const mockDeletionRequest = {
        id: "del-123",
        scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      (prisma.store.findUnique as any).mockResolvedValue(mockMerchant);
      (prisma.accountDeletionRequest.create as any).mockResolvedValue(mockDeletionRequest);
      (prisma.adminAuditLog.create as any).mockResolvedValue({});

      const result = await gdpr.handleDeletionRequest("store-123", "user-123");

      expect(result.deletionRequestId).toBe("del-123");
      expect(result.scheduledFor).toBeInstanceOf(Date);
      expect(whatsapp.messages).toHaveLength(1);
    });

    it("should throw error if merchant not found", async () => {
      (prisma.store.findUnique as any).mockResolvedValue(null);

      await expect(gdpr.handleDeletionRequest("non-existent", "user-123")).rejects.toThrow("Merchant not found");
    });
  });

  describe("cancelDeletionRequest", () => {
    it("should cancel pending deletion request", async () => {
      const mockDeletionRequest = {
        id: "del-123",
        storeId: "store-123",
        requestedByUserId: "user-123",
      };

      (prisma.accountDeletionRequest.update as any).mockResolvedValue(mockDeletionRequest);
      (prisma.adminAuditLog.create as any).mockResolvedValue({});

      await gdpr.cancelDeletionRequest("del-123");

      expect(prisma.accountDeletionRequest.update).toHaveBeenCalledWith({
        where: { id: "del-123" },
        data: {
          status: "CANCELED",
          updatedAt: expect.any(Date),
        },
      });
      expect(whatsapp.messages).toHaveLength(1);
    });
  });

  describe("recordConsent", () => {
    it("should record consent with metadata", async () => {
      // Mock the consentRecord through type assertion
      const mockConsentRecord = {
        create: vi.fn().mockResolvedValue({}),
      };
      (prisma as unknown as { consentRecord: typeof mockConsentRecord }).consentRecord = mockConsentRecord;

      await gdpr.recordConsent("store-123", "marketing", true, {
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0",
      });

      expect(mockConsentRecord.create).toHaveBeenCalledWith({
        data: {
          storeId: "store-123",
          consentType: "marketing",
          granted: true,
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          createdAt: expect.any(Date),
        },
      });
    });
  });

  describe("getConsentStatus", () => {
    it("should return current consent status", async () => {
      const mockRecords = [
        { consentType: "marketing", granted: true, createdAt: new Date("2024-01-03") },
        { consentType: "analytics", granted: false, createdAt: new Date("2024-01-02") },
        { consentType: "third_party", granted: true, createdAt: new Date("2024-01-01") },
      ];

      const mockConsentRecord = {
        findMany: vi.fn().mockResolvedValue(mockRecords),
      };
      (prisma as unknown as { consentRecord: typeof mockConsentRecord }).consentRecord = mockConsentRecord;

      const result = await gdpr.getConsentStatus("store-123");

      expect(result.marketing).toBe(true);
      expect(result.analytics).toBe(false);
      expect(result.thirdParty).toBe(true);
      // lastUpdated returns records[0].createdAt (first record in array)
      expect(result.lastUpdated).toEqual(new Date("2024-01-03"));
    });

    it("should return false for missing consent types", async () => {
      const mockConsentRecord = {
        findMany: vi.fn().mockResolvedValue([]),
      };
      (prisma as unknown as { consentRecord: typeof mockConsentRecord }).consentRecord = mockConsentRecord;

      const result = await gdpr.getConsentStatus("store-123");

      expect(result.marketing).toBe(false);
      expect(result.analytics).toBe(false);
      expect(result.thirdParty).toBe(false);
    });
  });

  describe("hasPendingDeletion", () => {
    it("should return true if pending deletion exists", async () => {
      (prisma.accountDeletionRequest.count as any).mockResolvedValue(1);

      const result = await gdpr.hasPendingDeletion("store-123");

      expect(result).toBe(true);
    });

    it("should return false if no pending deletion", async () => {
      (prisma.accountDeletionRequest.count as any).mockResolvedValue(0);

      const result = await gdpr.hasPendingDeletion("store-123");

      expect(result).toBe(false);
    });
  });

  describe("getPendingDeletionsDue", () => {
    it("should return deletions that are due", async () => {
      const mockDeletions = [
        { id: "del-1", storeId: "store-1", scheduledFor: new Date() },
        { id: "del-2", storeId: "store-2", scheduledFor: new Date() },
      ];

      (prisma.accountDeletionRequest.findMany as any).mockResolvedValue(mockDeletions);

      const result = await gdpr.getPendingDeletionsDue();

      expect(result).toHaveLength(2);
      expect(result[0].storeId).toBe("store-1");
    });
  });
});
