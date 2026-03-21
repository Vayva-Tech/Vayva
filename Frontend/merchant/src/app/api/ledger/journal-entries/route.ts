// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
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

      // Call backend API to create journal entry
      const result = await apiJson<{
        success: boolean;
        data?: { id: string; referenceId: string; entryId: string };
        error?: string;
      }>(
        `${process.env.BACKEND_API_URL}/api/ledger/journal-entries`,
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
      
      return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/ledger/journal-entries", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
