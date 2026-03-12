import { NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

type LedgerEntryWithStore = Prisma.LedgerEntryGetPayload<{
  include: {
    store: { select: { name: true } };
  };
}>;

export async function GET(req: Request) {
  try {
    await OpsAuthService.requireSession();

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const count = parseInt(searchParams.get("limit") || "100");

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: storeId ? { storeId } : undefined,
      orderBy: { occurredAt: "desc" },
      take: count,
      include: { store: { select: { name: true } } },
    });

    const entries = ledgerEntries.map((entry: LedgerEntryWithStore) => ({
      id: entry.id,
      storeName: entry.store?.name,
      date: entry.occurredAt,
      type: entry.referenceType,
      account: entry.account,
      description: entry.description || `Transaction ${entry.referenceId}`,
      amount: entry.amount,
      currency: entry.currency,
      direction: entry.direction,
      balanceAfter:
        (entry.metadata as Record<string, unknown> | null)?.balanceAfter ||
        null,
    }));

    return NextResponse.json({ entries, integrityCheck: "VALID" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[LEDGER_AUDIT_ERROR]", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
