import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

// Mock dependencies
vi.mock("@/lib/ops-auth", () => ({
  OpsAuthService: {
    requireSession: vi.fn(),
    logEvent: vi.fn(),
  },
}));

// Hoisted mock functions for prisma
const {
  mockKycFindMany,
  mockKycFindUnique,
  mockKycUpdate,
  mockStoreUpdate,
  mockWalletUpdateMany,
  mockBankFindFirst,
} = vi.hoisted(() => ({
  mockKycFindMany: vi.fn(),
  mockKycFindUnique: vi.fn(),
  mockKycUpdate: vi.fn(),
  mockStoreUpdate: vi.fn(),
  mockWalletUpdateMany: vi.fn(),
  mockBankFindFirst: vi.fn(),
}));

vi.mock("@vayva/db", async () => {
  const actual = await vi.importActual("@vayva/db");
  return {
    ...actual,
    prisma: {
      kycRecord: {
        findMany: mockKycFindMany,
        findUnique: mockKycFindUnique,
        update: mockKycUpdate,
      },
      store: {
        update: mockStoreUpdate,
      },
      wallet: {
        updateMany: mockWalletUpdateMany,
      },
      bankBeneficiary: {
        findFirst: mockBankFindFirst,
      },
    },
  };
});

vi.mock("@vayva/shared", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// @ts-expect-error - Module resolution pending
import { OpsAuthService } from "@/lib/ops-auth";

describe("GET /api/ops/kyc", () => {
  const mockUser = { id: "user-123", email: "admin@vayva.co", role: "OPS_ADMIN" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockKycFindMany.mockReset();
    mockBankFindFirst.mockReset();
    vi.mocked(OpsAuthService.requireSession).mockResolvedValue({ user: mockUser });
  });

  it("should require session", async () => {
    // Clear default mock and make requireSession throw
    vi.mocked(OpsAuthService.requireSession).mockImplementationOnce(() => {
      throw new Error("Unauthorized");
    });

    const response = await GET();
    const body = await response.json();

    expect((response as Response).status).toBe(500);
    expect(body.error).toBe("Failed to fetch KYC queue");
  });

  it("should return pending KYC records", async () => {
    const mockRecords = [
      {
        id: "kyc-1",
        storeId: "store-1",
        status: "ACKED",
        ninLast4: "1234",
        bvnLast4: "5678",
        cacNumberEncrypted: null,
        submittedAt: new Date(),
        createdAt: new Date(),
        reviewedAt: null,
        notes: null,
        store: {
          id: "store-1",
          name: "Test Store",
          slug: "test-store",
          industrySlug: "retail",
          onboardingStatus: "completed",
          onboardingLastStep: 7,
        },
      },
    ];

    const mockBank = {
      bankName: "Test Bank",
      bankCode: "001",
      accountNumber: "1234567890",
      accountName: "Test Owner",
    };

    mockKycFindMany.mockResolvedValue(mockRecords);
    mockBankFindFirst.mockResolvedValue(mockBank);

    const response = await GET();
    const body = await response.json();

    expect((response as Response).status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("kyc-1");
    expect(body.data[0].store.name).toBe("Test Store");
    expect(body.data[0].bank).toEqual(mockBank);
  });

  it("should handle empty KYC queue", async () => {
    mockKycFindMany.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect((response as Response).status).toBe(200);
    expect(body.data).toHaveLength(0);
  });

  it("should handle database errors gracefully", async () => {
    mockKycFindMany.mockRejectedValue(new Error("Database connection failed"));

    const response = await GET();
    const body = await response.json();

    expect((response as Response).status).toBe(500);
    expect(body.error).toBe("Failed to fetch KYC queue");
  });
});

describe("POST /api/ops/kyc", () => {
  const mockUser = { id: "ops-admin-123", email: "admin@vayva.co", role: "OPS_ADMIN" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockKycFindUnique.mockReset();
    mockKycUpdate.mockReset();
    mockStoreUpdate.mockReset();
    mockWalletUpdateMany.mockReset();
    vi.mocked(OpsAuthService.requireSession).mockResolvedValue({ user: mockUser });
    vi.mocked(OpsAuthService.logEvent).mockResolvedValue(undefined);
  });

  it("should approve KYC record successfully", async () => {
    const mockRecord = {
      id: "kyc-1",
      storeId: "store-1",
      status: "ACKED",
      store: { name: "Test Store" },
    };

    mockKycFindUnique.mockResolvedValue(mockRecord);
    mockKycUpdate.mockResolvedValue({ ...mockRecord, status: "VERIFIED" });
    mockStoreUpdate.mockResolvedValue({});
    mockWalletUpdateMany.mockResolvedValue({ count: 1 });

    const request = new Request("http://localhost:3002/api/ops/kyc", {
      method: "POST",
      body: JSON.stringify({
        id: "kyc-1",
        action: "approve",
        notes: "All documents verified",
      }),
    });

    const response = await POST(request as Request);
    const body = await response.json();

    expect((response as Response).status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockKycUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "kyc-1" },
        data: expect.objectContaining({
          reviewedBy: "ops-admin-123",
          notes: "All documents verified",
        }),
      })
    );
    expect(OpsAuthService.logEvent).toHaveBeenCalledWith(
      "ops-admin-123",
      "KYC_APPROVE",
      expect.objectContaining({
        kycRecordId: "kyc-1",
        storeId: "store-1",
      })
    );
  });

  it("should reject KYC record successfully", async () => {
    const mockRecord = {
      id: "kyc-1",
      storeId: "store-1",
      status: "ACKED",
      store: { name: "Test Store" },
    };

    mockKycFindUnique.mockResolvedValue(mockRecord);
    mockKycUpdate.mockResolvedValue({ ...mockRecord, status: "REJECTED" });
    mockStoreUpdate.mockResolvedValue({});
    mockWalletUpdateMany.mockResolvedValue({ count: 1 });

    const request = new Request("http://localhost:3002/api/ops/kyc", {
      method: "POST",
      body: JSON.stringify({
        id: "kyc-1",
        action: "reject",
        rejectionReason: "Invalid NIN document",
        notes: "Document appears forged",
      }),
    });

    const response = await POST(request as Request);
    const body = await response.json();

    expect((response as Response).status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockKycUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "kyc-1" },
        data: expect.objectContaining({
          rejectionReason: "Invalid NIN document",
        }),
      })
    );
    expect(OpsAuthService.logEvent).toHaveBeenCalledWith(
      "ops-admin-123",
      "KYC_REJECT",
      expect.objectContaining({
        kycRecordId: "kyc-1",
        rejectionReason: "Invalid NIN document",
      })
    );
  });

  it("should return 400 for invalid action", async () => {
    const request = new Request("http://localhost:3002/api/ops/kyc", {
      method: "POST",
      body: JSON.stringify({
        id: "kyc-1",
        action: "invalid-action",
      }),
    });

    const response = await POST(request as Request);
    const body = await response.json();

    expect((response as Response).status).toBe(400);
    expect(body.error).toBe("Invalid request");
  });

  it("should return 404 for non-existent record", async () => {
    mockKycFindUnique.mockResolvedValue(null);

    const request = new Request("http://localhost:3002/api/ops/kyc", {
      method: "POST",
      body: JSON.stringify({
        id: "non-existent",
        action: "approve",
      }),
    });

    const response = await POST(request as Request);
    const body = await response.json();

    expect((response as Response).status).toBe(404);
    expect(body.error).toBe("Record not found");
  });

  it("should require authentication", async () => {
    vi.mocked(OpsAuthService.requireSession).mockImplementationOnce(() => {
      throw new Error("Unauthorized");
    });

    const request = new Request("http://localhost:3002/api/ops/kyc", {
      method: "POST",
      body: JSON.stringify({
        id: "kyc-1",
        action: "approve",
      }),
    });

    // The route catches the error and returns 500
    const response = await POST(request as Request);
    const body = await response.json();

    expect((response as Response).status).toBe(500);
    expect(body.error).toBe("Failed to process KYC action");
  });

  it("should handle missing ID", async () => {
    const request = new Request("http://localhost:3002/api/ops/kyc", {
      method: "POST",
      body: JSON.stringify({
        action: "approve",
      }),
    });

    const response = await POST(request as Request);
    const body = await response.json();

    expect((response as Response).status).toBe(400);
    expect(body.error).toBe("Invalid request");
  });

  it("should update store and wallet status on approval", async () => {
    const mockRecord = {
      id: "kyc-1",
      storeId: "store-1",
      status: "ACKED",
      store: { name: "Test Store" },
    };

    mockKycFindUnique.mockResolvedValue(mockRecord);
    mockKycUpdate.mockResolvedValue({ ...mockRecord, status: "VERIFIED" });
    mockStoreUpdate.mockResolvedValue({});
    mockWalletUpdateMany.mockResolvedValue({ count: 1 });

    const request = new Request("http://localhost:3002/api/ops/kyc", {
      method: "POST",
      body: JSON.stringify({
        id: "kyc-1",
        action: "approve",
      }),
    });

    await POST(request as Request);

    // Verify store update
    expect(mockStoreUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "store-1" },
        data: expect.objectContaining({
          kycStatus: "VERIFIED",
        }),
      })
    );

    // Verify wallet update
    expect(mockWalletUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { storeId: "store-1" },
        data: { kycStatus: "VERIFIED" },
      })
    );
  });

  it("should handle database errors gracefully", async () => {
    mockKycFindUnique.mockRejectedValue(new Error("Database connection failed"));

    const request = new Request("http://localhost:3002/api/ops/kyc", {
      method: "POST",
      body: JSON.stringify({
        id: "kyc-1",
        action: "approve",
      }),
    });

    const response = await POST(request as Request);
    const body = await response.json();

    expect((response as Response).status).toBe(500);
    expect(body.error).toBe("Failed to process KYC action");
  });
});
