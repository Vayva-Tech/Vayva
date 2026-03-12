import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { InventoryService } from "@vayva/inventory";
import { PosService } from "@vayva/pos";
import { prisma } from "@vayva/db";

// Mock prisma
vi.mock("@vayva/db", () => ({
  prisma: {
    inventoryAdjustment: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    inventoryItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    posDevice: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    posSyncQueue: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    cashSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    cashMovement: {
      create: vi.fn(),
    },
  },
}));

describe("InventoryService", () => {
  let inventoryService: InventoryService;
  const mockStoreId = "test-store-id";

  beforeEach(() => {
    inventoryService = new InventoryService();
    vi.clearAllMocks();
  });

  describe("recordAdjustment", () => {
    it("should record a positive inventory adjustment", async () => {
      const mockAdjustment = {
        id: "adj-1",
        storeId: mockStoreId,
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        delta: 5,
        reason: "purchase",
        reference: "PO-123",
        note: "New shipment received",
        createdBy: "user-1",
        createdAt: new Date(),
      };

      const mockInventoryItem = {
        id: "item-1",
        storeId: mockStoreId,
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        quantity: 10,
        reserved: 2,
        available: 8,
      };

      (prisma.inventoryAdjustment.create as any).mockResolvedValue(mockAdjustment);
      (prisma.inventoryItem.findUnique as any).mockResolvedValue(mockInventoryItem);
      (prisma.inventoryItem.update as any).mockResolvedValue({
        ...mockInventoryItem,
        quantity: 15,
        available: 13,
      });

      const result = await inventoryService.recordAdjustment(mockStoreId, {
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        delta: 5,
        reason: "purchase",
        reference: "PO-123",
        note: "New shipment received",
        createdBy: "user-1",
      });

      expect(result).toEqual(mockAdjustment);
      expect(prisma.inventoryAdjustment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          storeId: mockStoreId,
          productId: "prod-1",
          delta: 5,
          reason: "purchase",
        }),
      });
      expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: "item-1" },
        data: {
          quantity: 15,
          available: 13,
        },
      });
    });

    it("should record a negative inventory adjustment", async () => {
      const mockAdjustment = {
        id: "adj-2",
        storeId: mockStoreId,
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        delta: -3,
        reason: "damage",
        note: "Damaged during handling",
        createdBy: "user-1",
        createdAt: new Date(),
      };

      const mockInventoryItem = {
        id: "item-1",
        storeId: mockStoreId,
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        quantity: 10,
        reserved: 2,
        available: 8,
      };

      (prisma.inventoryAdjustment.create as any).mockResolvedValue(mockAdjustment);
      (prisma.inventoryItem.findUnique as any).mockResolvedValue(mockInventoryItem);
      (prisma.inventoryItem.update as any).mockResolvedValue({
        ...mockInventoryItem,
        quantity: 7,
        available: 5,
      });

      const result = await inventoryService.recordAdjustment(mockStoreId, {
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        delta: -3,
        reason: "damage",
        note: "Damaged during handling",
        createdBy: "user-1",
      });

      expect(result).toEqual(mockAdjustment);
      expect(prisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: "item-1" },
        data: {
          quantity: 7,
          available: 5,
        },
      });
    });

    it("should create inventory item if it doesn't exist", async () => {
      const mockAdjustment = {
        id: "adj-3",
        storeId: mockStoreId,
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        delta: 10,
        reason: "initial_stock",
        createdBy: "user-1",
        createdAt: new Date(),
      };

      (prisma.inventoryAdjustment.create as any).mockResolvedValue(mockAdjustment);
      (prisma.inventoryItem.findUnique as any).mockResolvedValue(null);
      (prisma.inventoryItem.create as any).mockResolvedValue({
        id: "item-1",
        storeId: mockStoreId,
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        quantity: 10,
        reserved: 0,
        available: 10,
      });

      const result = await inventoryService.recordAdjustment(mockStoreId, {
        productId: "prod-1",
        variantId: "var-1",
        locationId: "loc-1",
        delta: 10,
        reason: "initial_stock",
        createdBy: "user-1",
      });

      expect(result).toEqual(mockAdjustment);
      expect(prisma.inventoryItem.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          productId: "prod-1",
          variantId: "var-1",
          locationId: "loc-1",
          quantity: 10,
          reserved: 0,
          available: 10,
        },
      });
    });
  });

  describe("getAdjustments", () => {
    it("should return adjustments with filters", async () => {
      const mockAdjustments = [
        {
          id: "adj-1",
          productId: "prod-1",
          variantId: "var-1",
          locationId: "loc-1",
          delta: 5,
          reason: "purchase",
          createdAt: new Date(),
        },
      ];

      (prisma.inventoryAdjustment.findMany as any).mockResolvedValue(mockAdjustments);

      const result = await inventoryService.getAdjustments(mockStoreId, {
        productId: "prod-1",
        locationId: "loc-1",
        limit: 10,
      });

      expect(result).toEqual(mockAdjustments);
      expect(prisma.inventoryAdjustment.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          productId: "prod-1",
          locationId: "loc-1",
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });
  });
});

describe("PosService", () => {
  let posService: PosService;
  const mockStoreId = "test-store-id";

  beforeEach(() => {
    posService = new PosService();
    vi.clearAllMocks();
  });

  describe("getDevices", () => {
    it("should return POS devices for store", async () => {
      const mockDevices = [
        {
          id: "device-1",
          storeId: mockStoreId,
          name: "Register 1",
          locationId: "loc-1",
          status: "online",
          lastSeenAt: new Date(),
          registeredAt: new Date(),
        },
      ];

      (prisma.posDevice.findMany as any).mockResolvedValue(mockDevices);

      const result = await posService.getDevices(mockStoreId);

      expect(result).toEqual(mockDevices);
      expect(prisma.posDevice.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        orderBy: { registeredAt: "desc" },
      });
    });

    it("should filter devices by location", async () => {
      const mockDevices = [
        {
          id: "device-1",
          storeId: mockStoreId,
          name: "Register 1",
          locationId: "loc-1",
          status: "online",
        },
      ];

      (prisma.posDevice.findMany as any).mockResolvedValue(mockDevices);

      const result = await posService.getDevices(mockStoreId, { locationId: "loc-1" });

      expect(prisma.posDevice.findMany).toHaveBeenCalledWith({
        where: { 
          storeId: mockStoreId,
          locationId: "loc-1",
        },
        orderBy: { registeredAt: "desc" },
      });
    });
  });

  describe("enqueueSync", () => {
    it("should enqueue sync job for device", async () => {
      const mockSyncJob = {
        id: "sync-1",
        deviceId: "device-1",
        storeId: mockStoreId,
        entityType: "order",
        entityId: "order-1",
        action: "create",
        priority: 1,
        status: "pending",
        retryCount: 0,
        createdAt: new Date(),
      };

      (prisma.posSyncQueue.create as any).mockResolvedValue(mockSyncJob);

      const result = await posService.enqueueSync(mockStoreId, {
        deviceId: "device-1",
        entityType: "order",
        entityId: "order-1",
        action: "create",
        priority: 1,
      });

      expect(result).toEqual(mockSyncJob);
      expect(prisma.posSyncQueue.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          deviceId: "device-1",
          entityType: "order",
          entityId: "order-1",
          action: "create",
          priority: 1,
          status: "pending",
          payload: undefined,
          scheduledFor: undefined,
        },
      });
    });
  });

  describe("openCashSession", () => {
    it("should open new cash session", async () => {
      const mockSession = {
        id: "session-1",
        deviceId: "device-1",
        storeId: mockStoreId,
        openedBy: "user-1",
        openingAmount: 100.00,
        cashSales: 0,
        cashReturns: 0,
        payouts: 0,
        deposits: 0,
        status: "open",
        openedAt: new Date(),
      };

      (prisma.cashSession.create as any).mockResolvedValue(mockSession);

      const result = await posService.openCashSession(mockStoreId, {
        deviceId: "device-1",
        openedBy: "user-1",
        openingAmount: 100.00,
      });

      expect(result).toEqual(mockSession);
      expect(prisma.cashSession.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          deviceId: "device-1",
          openedBy: "user-1",
          openingAmount: 100.00,
          cashSales: 0,
          cashReturns: 0,
          payouts: 0,
          deposits: 0,
          status: "open",
        },
      });
    });
  });

  describe("recordCashMovement", () => {
    it("should record cash payout", async () => {
      const mockMovement = {
        id: "move-1",
        sessionId: "session-1",
        type: "payout",
        amount: 25.00,
        reason: "refund",
        recordedBy: "user-1",
        recordedAt: new Date(),
      };

      (prisma.cashMovement.create as any).mockResolvedValue(mockMovement);
      (prisma.cashSession.findUnique as any).mockResolvedValue({
        id: "session-1",
        status: "open",
        payouts: 0,
      });
      (prisma.cashSession.update as any).mockResolvedValue({
        id: "session-1",
        payouts: 25.00,
      });

      const result = await posService.recordCashMovement("session-1", {
        type: "payout",
        amount: 25.00,
        reason: "refund",
        recordedBy: "user-1",
      });

      expect(result).toEqual(mockMovement);
      expect(prisma.cashMovement.create).toHaveBeenCalledWith({
        data: {
          sessionId: "session-1",
          type: "payout",
          amount: 25.00,
          reason: "refund",
          recordedBy: "user-1",
        },
      });
      expect(prisma.cashSession.update).toHaveBeenCalledWith({
        where: { id: "session-1" },
        data: { payouts: 25.00 },
      });
    });

    it("should record cash deposit", async () => {
      const mockMovement = {
        id: "move-2",
        sessionId: "session-1",
        type: "deposit",
        amount: 50.00,
        reason: "change fund",
        recordedBy: "user-1",
        recordedAt: new Date(),
      };

      (prisma.cashMovement.create as any).mockResolvedValue(mockMovement);
      (prisma.cashSession.findUnique as any).mockResolvedValue({
        id: "session-1",
        status: "open",
        deposits: 0,
      });
      (prisma.cashSession.update as any).mockResolvedValue({
        id: "session-1",
        deposits: 50.00,
      });

      const result = await posService.recordCashMovement("session-1", {
        type: "deposit",
        amount: 50.00,
        reason: "change fund",
        recordedBy: "user-1",
      });

      expect(result).toEqual(mockMovement);
      expect(prisma.cashSession.update).toHaveBeenCalledWith({
        where: { id: "session-1" },
        data: { deposits: 50.00 },
      });
    });
  });
});