import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateStoreCompliance } from "./compliance";

// Import the actual module to get PolicyType values
import { prisma, PolicyType } from "@vayva/db";

// Mock prisma methods
vi.mock("@vayva/db", async () => {
  const actual = await vi.importActual<typeof import("@vayva/db")>("@vayva/db");
  return {
    ...actual,
    prisma: {
      store: {
        findUnique: vi.fn(),
      },
      product: {
        count: vi.fn(),
      },
      merchantPolicy: {
        findMany: vi.fn(),
      },
    },
  };
});

describe("validateStoreCompliance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return valid compliance report for compliant store", async () => {
    const mockStore = {
      id: "store-123",
      logoUrl: "https://example.com/logo.png",
      socialImage: "https://example.com/social.png",
      name: "Test Store",
      seoDescription: "A test store description",
    };

    (prisma.store.findUnique as any).mockResolvedValue(mockStore);
    (prisma.product.count as any).mockResolvedValue(10);
    (prisma.merchantPolicy.findMany as any).mockResolvedValue([
      { type: PolicyType.PRIVACY, status: "PUBLISHED" },
      { type: PolicyType.TERMS, status: "PUBLISHED" },
      { type: PolicyType.RETURNS, status: "PUBLISHED" },
      { type: PolicyType.REFUNDS, status: "PUBLISHED" },
      { type: PolicyType.SHIPPING_DELIVERY, status: "PUBLISHED" },
    ]);

    const result = await validateStoreCompliance("store-123");

    expect(result.storeId).toBe("store-123");
    expect(result.isValid).toBe(true);
    expect(result.checks.legalPolicies).toBe(true);
    expect(result.checks.productReadiness).toBe(true);
    expect(result.checks.brandingReadiness).toBe(true);
    expect(result.checks.contentModeration).toBe(true);
    expect(result.details.missingPolicies).toHaveLength(0);
    expect(result.details.productCount).toBe(10);
  });

  it("should detect missing policies", async () => {
    const mockStore = {
      id: "store-123",
      logoUrl: "https://example.com/logo.png",
      socialImage: "https://example.com/social.png",
      name: "Test Store",
      seoDescription: "A test store description",
    };

    (prisma.store.findUnique as any).mockResolvedValue(mockStore);
    (prisma.product.count as any).mockResolvedValue(10);
    (prisma.merchantPolicy.findMany as any).mockResolvedValue([
      { type: PolicyType.PRIVACY, status: "PUBLISHED" },
      // Missing other policies
    ]);

    const result = await validateStoreCompliance("store-123");

    expect(result.isValid).toBe(false);
    expect(result.checks.legalPolicies).toBe(false);
    expect(result.details.missingPolicies).toContain(PolicyType.TERMS);
    expect(result.details.missingPolicies).toContain(PolicyType.RETURNS);
    expect(result.details.missingPolicies).toContain(PolicyType.REFUNDS);
    expect(result.details.missingPolicies).toContain(PolicyType.SHIPPING_DELIVERY);
  });

  it("should detect missing products", async () => {
    const mockStore = {
      id: "store-123",
      logoUrl: "https://example.com/logo.png",
      socialImage: "https://example.com/social.png",
      name: "Test Store",
      seoDescription: "A test store description",
    };

    (prisma.store.findUnique as any).mockResolvedValue(mockStore);
    (prisma.product.count as any).mockResolvedValue(0);
    (prisma.merchantPolicy.findMany as any).mockResolvedValue([
      { type: PolicyType.PRIVACY, status: "PUBLISHED" },
      { type: PolicyType.TERMS, status: "PUBLISHED" },
      { type: PolicyType.RETURNS, status: "PUBLISHED" },
      { type: PolicyType.REFUNDS, status: "PUBLISHED" },
      { type: PolicyType.SHIPPING_DELIVERY, status: "PUBLISHED" },
    ]);

    const result = await validateStoreCompliance("store-123");

    expect(result.isValid).toBe(false);
    expect(result.checks.productReadiness).toBe(false);
    expect(result.details.productCount).toBe(0);
  });

  it("should detect missing branding", async () => {
    const mockStore = {
      id: "store-123",
      logoUrl: null,
      socialImage: null,
      name: "Test Store",
      seoDescription: "A test store description",
    };

    (prisma.store.findUnique as any).mockResolvedValue(mockStore);
    (prisma.product.count as any).mockResolvedValue(10);
    (prisma.merchantPolicy.findMany as any).mockResolvedValue([
      { type: PolicyType.PRIVACY, status: "PUBLISHED" },
      { type: PolicyType.TERMS, status: "PUBLISHED" },
      { type: PolicyType.RETURNS, status: "PUBLISHED" },
      { type: PolicyType.REFUNDS, status: "PUBLISHED" },
      { type: PolicyType.SHIPPING_DELIVERY, status: "PUBLISHED" },
    ]);

    const result = await validateStoreCompliance("store-123");

    expect(result.checks.brandingReadiness).toBe(false);
  });

  it("should detect prohibited content", async () => {
    const mockStore = {
      id: "store-123",
      logoUrl: "https://example.com/logo.png",
      socialImage: "https://example.com/social.png",
      name: "Scam Store",
      seoDescription: "We sell illegal weapons and drugs",
    };

    (prisma.store.findUnique as any).mockResolvedValue(mockStore);
    (prisma.product.count as any).mockResolvedValue(10);
    (prisma.merchantPolicy.findMany as any).mockResolvedValue([
      { type: PolicyType.PRIVACY, status: "PUBLISHED" },
      { type: PolicyType.TERMS, status: "PUBLISHED" },
      { type: PolicyType.RETURNS, status: "PUBLISHED" },
      { type: PolicyType.REFUNDS, status: "PUBLISHED" },
      { type: PolicyType.SHIPPING_DELIVERY, status: "PUBLISHED" },
    ]);

    const result = await validateStoreCompliance("store-123");

    expect(result.isValid).toBe(false);
    expect(result.checks.contentModeration).toBe(false);
    expect(result.details.prohibitedWordsFound.length).toBeGreaterThan(0);
  });

  it("should throw error if store not found", async () => {
    (prisma.store.findUnique as any).mockResolvedValue(null);

    await expect(validateStoreCompliance("non-existent")).rejects.toThrow("Store not found");
  });
});
