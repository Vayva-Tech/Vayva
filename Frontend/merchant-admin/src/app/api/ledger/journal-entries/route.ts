import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// POST /api/ledger/journal-entries - Create manual journal entry
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_EDIT,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; email?: string } }) => {
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

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/ledger/journal-entries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            referenceId,
            direction,
            account,
            amount,
            currency,
            description,
            occurredAt,
            metadata: {
              ...metadata,
              createdBy: user.id,
              createdByEmail: user.email,
              source: "manual_journal_entry",
            },
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create journal entry" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create journal entry" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data }, { status: 201 });
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
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const account = searchParams.get("account");
      const limit = searchParams.get("limit") || "50";

      // Build query string
      const queryParams = new URLSearchParams();
      if (account) queryParams.set("account", account);
      queryParams.set("limit", limit);
      queryParams.set("referenceType", "manual");

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/ledger/journal-entries?${queryParams.toString()}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch journal entries" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch journal entries" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data });
    } catch (error: unknown) {
      logger.error("[LEDGER_JOURNAL_ENTRIES_GET] Failed to fetch journal entries", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch journal entries" },
        { status: 500 }
      );
    }
  }
);
