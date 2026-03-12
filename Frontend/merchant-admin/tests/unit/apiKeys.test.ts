import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiKeyService } from "../../src/lib/security/apiKeys";
import { prisma } from "../../src/lib/prisma";

// Mock Prisma
vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    apiKey: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe("ApiKeyService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a key with valid structure", async () => {
    (prisma.apiKey.create as any).mockResolvedValue({
      id: "key_123",
      scopes: ["read"],
      status: "ACTIVE",
    });

    const result = await ApiKeyService.createKey(
      "store_1",
      "Test Key",
      ["read"],
      "user_1",
    );
    expect(result.key).toContain("vayva_live_");
    expect(prisma.apiKey.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          storeId: "store_1",
          name: "Test Key",
        }),
      }),
    );
  });

  it("should verify a valid key", async () => {
    const rawKey = "vayva_live_abc123";
    const keyHash = ApiKeyService.hashKey(rawKey);

    (prisma.apiKey.findUnique as any).mockResolvedValue({
      id: "key_123",
      status: "ACTIVE",
      expiresAt: null,
      ipAllowlist: [],
      keyHash: keyHash,
    });

    const result = await ApiKeyService.verifyApiKey(rawKey);
    expect(result.id).toBe("key_123");
  });

  it("should reject an expired key", async () => {
    const rawKey = "vayva_live_expired";
    const keyHash = ApiKeyService.hashKey(rawKey);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    (prisma.apiKey.findUnique as any).mockResolvedValue({
      id: "key_expired",
      status: "ACTIVE",
      expiresAt: yesterday,
      ipAllowlist: [],
      keyHash: keyHash,
    });

    await expect(ApiKeyService.verifyApiKey(rawKey)).rejects.toThrow(
      "API Key has expired",
    );
  });

  it("should reject a disallowed IP", async () => {
    const rawKey = "vayva_live_ip";
    const keyHash = ApiKeyService.hashKey(rawKey);

    (prisma.apiKey.findUnique as any).mockResolvedValue({
      id: "key_ip",
      status: "ACTIVE",
      expiresAt: null,
      ipAllowlist: ["10.0.0.1"],
      keyHash: keyHash,
    });

    await expect(
      ApiKeyService.verifyApiKey(rawKey, "192.168.1.1"),
    ).rejects.toThrow("IP 192.168.1.1 is not allowed");
  });

  it("should accept an allowed IP", async () => {
    const rawKey = "vayva_live_ip_good";
    const keyHash = ApiKeyService.hashKey(rawKey);

    (prisma.apiKey.findUnique as any).mockResolvedValue({
      id: "key_ip_good",
      status: "ACTIVE",
      expiresAt: null,
      ipAllowlist: ["192.168.1.1"],
      keyHash: keyHash,
    });

    const result = await ApiKeyService.verifyApiKey(rawKey, "192.168.1.1");
    expect(result.id).toBe("key_ip_good");
  });
});
