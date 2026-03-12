import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { createLedgerEntry } from "@/lib/accounting/ledger";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

interface ImportEntry {
  referenceId: string;
  direction: "debit" | "credit";
  account: string;
  amount: number;
  currency?: string;
  description?: string;
  occurredAt?: string;
}

interface ImportPayload {
  entries: ImportEntry[];
  format?: "csv" | "json";
}

// POST /api/ledger/import - Bulk import ledger entries (CSV/JSON)
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_EDIT,
  async (req: Request, { storeId, user }: { storeId: string; user: { id: string; email?: string } }) => {
    try {
      const body = await req.json() as ImportPayload;
      const { entries, format = "json" } = body;

      // Validate entries array
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return NextResponse.json(
          { success: false, error: "No entries provided" },
          { status: 400 }
        );
      }

      // Validate max entries limit
      if (entries.length > 1000) {
        return NextResponse.json(
          { success: false, error: "Maximum 1000 entries allowed per import" },
          { status: 400 }
        );
      }

      const results: { success: boolean; entry?: { id: string; referenceId: string }; error?: string; index: number }[] = [];
      let successCount = 0;
      let errorCount = 0;

      // Process each entry
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        
        try {
          // Validate required fields
          if (!entry.referenceId || !entry.direction || !entry.account || entry.amount === undefined) {
            results.push({ success: false, error: "Missing required fields", index: i });
            errorCount++;
            continue;
          }

          // Validate direction
          if (!["debit", "credit"].includes(entry.direction)) {
            results.push({ success: false, error: "Direction must be 'debit' or 'credit'", index: i });
            errorCount++;
            continue;
          }

          // Validate amount
          if (typeof entry.amount !== "number" || entry.amount <= 0) {
            results.push({ success: false, error: "Amount must be a positive number", index: i });
            errorCount++;
            continue;
          }

          // Create the ledger entry
          const created = await createLedgerEntry({
            storeId,
            referenceType: "manual",
            referenceId: entry.referenceId,
            direction: entry.direction,
            account: entry.account,
            amount: entry.amount,
            currency: entry.currency || "NGN",
            description: entry.description || `Bulk import entry - ${entry.referenceId}`,
            occurredAt: entry.occurredAt ? new Date(entry.occurredAt) : new Date(),
            metadata: {
              importFormat: format,
              importIndex: i,
              createdBy: user.id,
              createdByEmail: user.email,
              source: "bulk_import",
              createdAt: new Date().toISOString(),
            },
          });

          results.push({ success: true, entry: { id: created.id, referenceId: created.referenceId }, index: i });
          successCount++;
        } catch (entryError) {
          const errorMsg = entryError instanceof Error ? entryError.message : "Unknown error";
          results.push({ success: false, error: errorMsg, index: i });
          errorCount++;
        }
      }

      // Create audit log for bulk import
      await prisma.auditLog.create({
        data: {
          app: "merchant",
          action: "LEDGER_BULK_IMPORT",
          targetType: "system",
          targetId: storeId,
          targetStoreId: storeId,
          actorUserId: user.id,
          severity: "HIGH",
          requestId: `import-${storeId}-${Date.now()}`,
          metadata: {
            totalEntries: entries.length,
            successCount,
            errorCount,
            format,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            total: entries.length,
            success: successCount,
            errors: errorCount,
          },
          results,
        },
      });
    } catch (error: unknown) {
      logger.error("[LEDGER_IMPORT_POST] Failed to import ledger entries", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to import ledger entries" },
        { status: 500 }
      );
    }
  }
);
