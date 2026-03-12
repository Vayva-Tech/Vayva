import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RescueService } from "./rescue.service";

// Mock Prisma
const mockCreate = vi.fn();
vi.mock("@vayva/db", () => ({
  prisma: {
    opsAuditEvent: {
      create: (...args: any[]) => mockCreate(...args),
    },
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const { mockDiagnosticCompletion } = vi.hoisted(() => {
  return { mockDiagnosticCompletion: vi.fn() };
});

// Mock RescueGroqClient via module mock
vi.mock("./rescue-client", () => {
  return {
    RescueGroqClient: vi.fn().mockImplementation(() => ({
      diagnosticCompletion: mockDiagnosticCompletion,
    })),
  };
});

describe("RescueService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPS_RESCUE_ENABLE = "true";
  });

  afterEach(() => {
    delete process.env.OPS_RESCUE_ENABLE;
  });

  it("should create an audit event upon intake", async () => {
    mockCreate.mockResolvedValue({ id: "audit-123" });
    mockDiagnosticCompletion.mockResolvedValue(
      "Analysis: Needs fix. \n- Step 1: Check logs.",
    );

    const result = await RescueService.intakeIncident({
      requestId: "req-1",
      source: "WEB",
      errorSnippet: "ReferenceError: x is not defined",
      sentryEventId: "sentry-123",
    });

    // Verify intake audit
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: "SYSTEM_RESCUE_INTAKE",
          metadata: expect.objectContaining({
            requestId: "req-1",
            sentryEventId: "sentry-123",
          }),
        }),
      }),
    );

    // Verify result audit
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: "SYSTEM_RESCUE_RESULT",
          metadata: expect.objectContaining({ intakeEventId: "audit-123" }),
        }),
      }),
    );

    expect(result.status).toBe("ANALYZED");
    expect(result.escalationPath).toBeDefined();
  });

  it("should return QUEUED if feature is disabled", async () => {
    process.env.OPS_RESCUE_ENABLE = "false";
    mockCreate.mockResolvedValue({ id: "audit-disabled" });

    const result = await RescueService.intakeIncident({
      requestId: "req-1",
      source: "WEB",
      errorSnippet: "Error",
    });

    expect(mockCreate).toHaveBeenCalledTimes(1); // Intake only
    expect(result.status).toBe("QUEUED");
    expect(result.diagnosis).toContain("disabled");
    expect(mockDiagnosticCompletion).not.toHaveBeenCalled();
  });

  it("should extract escalation and classification correctly", async () => {
    mockCreate.mockResolvedValue({ id: "audit-ex" });
    mockDiagnosticCompletion.mockResolvedValue(
      "Classification: DATABASE\nRoot cause: Disk full.\n- Step 1: Purge logs.\nEscalation Path: Infra Team on call.",
    );

    const result = await RescueService.intakeIncident({
      requestId: "req-ex",
      source: "CLI",
      errorSnippet: "Disk full",
    });

    expect(result.status).toBe("ANALYZED");
    expect(result.escalationPath).toBe("Infra Team on call.");
    expect(result.suggestedRemediation[0]).toContain("Purge logs.");

    // Verify result audit has classification
    expect(mockCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: "SYSTEM_RESCUE_RESULT",
          metadata: expect.objectContaining({
            classification: "DATABASE",
          }),
        }),
      }),
    );
  });
});
