import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { createLedgerEntry } from "@/lib/accounting/ledger";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST /api/ledger/journal-entries - Create manual journal entry
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_EDIT,
  async (req: Request, { storeId, user }: { storeId: string; user: { id: string; email?: string } }) => {
    try {
      const body = await req.json();
      const { 
        referenceId, 
        direction, 
        account, 
        amount, 
        currency = "NGN", 
        description, 
        occurredAt,
        metadata 
      } = body;

      // Validate required fields
      if (!referenceId || !direction || !account || !amount) {
        return NextResponse.json(
          { success: false, error: "Missing required fields: referenceId, direction, account, amount" },
          { status: 400 }
        );
      }

      // Validate direction
      if (!["debit", "credit"].includes(direction)) {
        return NextResponse.json(
          { success: false, error: "Direction must be 'debit' or 'credit'" },
          { status: 400 }
        );
      }

      // Validate amount
      if (typeof amount !== "number" || amount <= 0) {
        return NextResponse.json(
          { success: false, error: "Amount must be a positive number" },
          { status: 400 }
        );
      }

      // Create the ledger entry with audit metadata
      const entry = await createLedgerEntry({
        storeId,
        referenceType: "manual",
        referenceId,
        direction,
        account,
        amount,
        currency,
        description: description || `Manual journal entry - ${referenceId}`,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        metadata: {
          ...metadata,
          createdBy: user.id,
          createdByEmail: user.email,
          source: "manual_journal_entry",
          createdAt: new Date().toISOString(),
        },
      });

      // Create audit log for manual entry
      await prisma.auditLog.create({
        data: {
          app: "merchant",
          action: "MANUAL_LEDGER_ENTRY_CREATED",
          targetType: "system",
          targetId: entry.id,
          targetStoreId: storeId,
          actorUserId: user.id,
          severity: "HIGH",
          requestId: `manual-${storeId}-${Date.now()}`,
          metadata: {
            entryId: entry.id,
            account,
            direction,
            amount,
            referenceId,
            description,
          },
        },
      });

      return NextResponse.json({ success: true, data: entry }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[LEDGER_JOURNAL_ENTRIES_POST] Failed to create journal entry", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create journal entry" },
        { status: 500 }
      );
    }
  }
);

// GET /api/ledger/journal-entries - List manual journal entries
export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req: Request, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const account = searchParams.get("account");
      const limit = parseInt(searchParams.get("limit") || "50", 10);

      const entries = await prisma.ledgerEntry.findMany({
        where: {
          storeId,
          referenceType: "manual",
          ...(account && { account }),
        },
        orderBy: { occurredAt: "desc" },
        take: limit,
      });

      return NextResponse.json({
        success: true,
        data: entries.map(e => ({
          ...e,
          amount: Number(e.amount),
        })),
      });
    } catch (error: unknown) {
      logger.error("[LEDGER_JOURNAL_ENTRIES_GET] Failed to fetch journal entries", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch journal entries" },
        { status: 500 }
      );
    }
  }
);
