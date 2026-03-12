import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// POST /api/ledger/import - Bulk import ledger entries from CSV/JSON
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_EDIT,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; email?: string } }) => {
    try {
      const body = await req.json();
      const { entries, format = "json" } = body;

      // Validate entries
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return NextResponse.json(
          { success: false, error: "Entries array is required" },
          { status: 400 }
        );
      }

      // Validate entry count
      if (entries.length > 1000) {
        return NextResponse.json(
          { success: false, error: "Maximum 1000 entries allowed per import" },
          { status: 400 }
        );
      }

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/ledger/import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            entries,
            format,
            importedBy: user.id,
            importedByEmail: user.email,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to import ledger entries" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to import ledger entries" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[LEDGER_IMPORT_POST] Failed to import ledger entries", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to import ledger entries" },
        { status: 500 }
      );
    }
  }
);
