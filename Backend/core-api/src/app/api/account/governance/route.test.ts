import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUpdateExportStatus = vi.fn();
const mockUpdateDeletionStatus = vi.fn();
const mockRequestExport = vi.fn();
const mockAuditCreate = vi.fn();

let currentRole = "OWNER";

vi.mock("@/lib/api-handler", () => ({
  withVayvaAPI:
    (_permission: unknown, handler: (req: Request, ctx: any) => Promise<Response>) =>
    (req: Request) =>
      handler(req, {
        storeId: "store_test_1",
        user: {
          id: "user_test_1",
          role: currentRole,
        },
        correlationId: "corr-test-1",
      }),
}));

vi.mock("@/lib/team/permissions", () => ({
  PERMISSIONS: {
    EXPORTS_MANAGE: "exports:manage",
    APPROVALS_DECIDE: "approvals:decide",
  },
}));

vi.mock("@vayva/ai-agent", () => ({
  DataGovernanceService: {
    updateExportStatus: (...args: unknown[]) => mockUpdateExportStatus(...args),
    updateDeletionStatus: (...args: unknown[]) =>
      mockUpdateDeletionStatus(...args),
    requestExport: (...args: unknown[]) => mockRequestExport(...args),
  },
}));

vi.mock("@vayva/db", () => ({
  prisma: {
    auditLog: {
      create: (...args: unknown[]) => mockAuditCreate(...args),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import { PATCH, POST } from "./route";

describe("PATCH /api/account/governance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentRole = "OWNER";
    mockAuditCreate.mockResolvedValue({ id: "audit-1" });
    mockUpdateExportStatus.mockResolvedValue({ success: true });
    mockUpdateDeletionStatus.mockResolvedValue({ success: true });
  });

  it("returns 403 for non-owner/admin roles", async () => {
    currentRole = "STAFF";

    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "export",
          requestId: "exp-1",
          status: "RUNNING",
        }),
      }) as any,
    );

    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid requestType", async () => {
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ requestType: "bad", requestId: "r1", status: "RUNNING" }),
      }) as any,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("requestType");
  });

  it("returns 404 when export request is not found", async () => {
    mockUpdateExportStatus.mockResolvedValueOnce({
      success: false,
      error: "Export request not found.",
    });

    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "export",
          requestId: "exp-missing",
          status: "RUNNING",
        }),
      }) as any,
    );

    expect(res.status).toBe(404);
  });

  it("returns 422 for invalid deletion transition", async () => {
    mockUpdateDeletionStatus.mockResolvedValueOnce({
      success: false,
      error: "Invalid deletion status transition: REJECTED -> APPROVED",
    });

    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "deletion",
          requestId: "del-1",
          status: "APPROVED",
        }),
      }) as any,
    );

    expect(res.status).toBe(422);
  });

  it("returns 409 when export transition hits a concurrent update conflict", async () => {
    mockUpdateExportStatus.mockResolvedValueOnce({
      success: false,
      error: "Concurrent export status update detected for request exp-1",
    });

    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "export",
          requestId: "exp-1",
          status: "RUNNING",
        }),
      }) as any,
    );

    expect(res.status).toBe(409);
  });

  it("returns 200 and creates audit log on valid export transition", async () => {
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "export",
          requestId: "exp-1",
          status: "RUNNING",
        }),
      }) as any,
    );

    expect(res.status).toBe(200);
    expect(mockUpdateExportStatus).toHaveBeenCalledWith(
      "exp-1",
      "RUNNING",
      undefined,
    );
    expect(mockAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "GOVERNANCE_STATUS_UPDATED",
          targetType: "data_export_request",
          targetId: "exp-1",
        }),
      }),
    );
  });

  it("returns 200 noOp and skips audit log when transition is idempotent", async () => {
    mockUpdateExportStatus.mockResolvedValueOnce({
      success: true,
      noOp: true,
      currentStatus: "RUNNING",
    });

    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "export",
          requestId: "exp-1",
          status: "RUNNING",
        }),
      }) as any,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.noOp).toBe(true);
    expect(mockAuditCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when reasonCode is missing for FAILED status", async () => {
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "export",
          requestId: "exp-1",
          status: "FAILED",
        }),
      }) as any,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("reasonCode is required");
  });

  it("returns 400 for invalid reasonCode", async () => {
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "export",
          requestId: "exp-1",
          status: "FAILED",
          reasonCode: "INVALID_CODE",
        }),
      }) as any,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid reasonCode");
  });

  it("accepts valid reasonCode and includes it in audit metadata", async () => {
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          requestType: "export",
          requestId: "exp-1",
          status: "FAILED",
          reasonCode: "PROCESSING_FAILURE",
          errorMessage: "Export job crashed",
        }),
      }) as any,
    );

    expect(res.status).toBe(200);
    expect(mockUpdateExportStatus).toHaveBeenCalledWith(
      "exp-1",
      "FAILED",
      "Export job crashed",
    );
    expect(mockAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "GOVERNANCE_STATUS_UPDATED",
          metadata: expect.objectContaining({
            reasonCode: "PROCESSING_FAILURE",
          }),
        }),
      }),
    );
  });
});

describe("POST /api/account/governance (export creation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentRole = "OWNER";
    mockRequestExport.mockResolvedValue({
      success: true,
      request: {
        id: "export-req-1",
        status: "PENDING",
        expiresAt: "2026-02-27T00:00:00.000Z",
      },
    });
  });

  it("returns 400 when scopes is missing", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      }) as any,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("scopes must be a non-empty array");
  });

  it("returns 400 when scopes is empty array", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ scopes: [] }),
      }) as any,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("scopes must be a non-empty array");
  });

  it("returns 400 for invalid export scope", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ scopes: ["orders", "invalid_scope"] }),
      }) as any,
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Invalid export scope");
  });

  it("returns 409 when concurrent export request exists", async () => {
    mockRequestExport.mockResolvedValueOnce({
      success: false,
      error: "A pending export request already exists for this store.",
      requestId: "existing-req-1",
      status: "PENDING",
    });

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ scopes: ["orders", "customers"] }),
      }) as any,
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("A pending export request already exists");
    expect(body.requestId).toBe("existing-req-1");
  });

  it("returns 200 with export request details on success", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ scopes: ["orders", "customers", "products"] }),
      }) as any,
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.requestId).toBe("export-req-1");
    expect(body.status).toBe("PENDING");
    expect(body.scopes).toEqual(["orders", "customers", "products"]);
    expect(body.expiresAt).toBe("2026-02-27T00:00:00.000Z");
    expect(mockRequestExport).toHaveBeenCalledWith(
      "store_test_1",
      "user_test_1",
      ["orders", "customers", "products"],
    );
  });
});
