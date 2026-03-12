import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeletionService } from "./DeletionService";

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@vayva/db", () => ({
  prisma: {
    accountDeletionRequest: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

describe("DeletionService.confirmDeletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed tokens before any database lookup", async () => {
    const result = await DeletionService.confirmDeletion("not-a-valid-token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid confirmation token.");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("rejects token secrets that do not match request metadata", async () => {
    mockFindUnique.mockResolvedValue({
      id: "req-1",
      status: "SCHEDULED",
      scheduledFor: new Date("2026-02-20T00:00:00.000Z"),
      confirmationMeta: {
        tokenId: "req-1",
        tokenSecret: "secret-a",
        expiresAt: new Date("2026-03-20T00:00:00.000Z"),
      },
    });

    const result = await DeletionService.confirmDeletion("req-1.secret-b");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid confirmation token.");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("confirms valid request tokens and persists confirmedAt", async () => {
    mockFindUnique.mockResolvedValue({
      id: "req-2",
      status: "SCHEDULED",
      scheduledFor: new Date("2026-02-25T00:00:00.000Z"),
      confirmationMeta: {
        tokenId: "req-2",
        tokenSecret: "secret-ok",
        expiresAt: new Date("2026-03-20T00:00:00.000Z"),
      },
    });

    const result = await DeletionService.confirmDeletion("req-2.secret-ok");

    expect(result.success).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: "req-2" } });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "req-2" },
        data: expect.objectContaining({
          confirmationMeta: expect.objectContaining({
            tokenSecret: "secret-ok",
            confirmedAt: expect.any(String),
          }),
        }),
      }),
    );
  });
});
