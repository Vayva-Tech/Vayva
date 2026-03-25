import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const user = auth.user;

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }
    const b = body as Record<string, unknown>;
    const referenceId = typeof b.referenceId === "string" ? b.referenceId : undefined;
    const direction = typeof b.direction === "string" ? b.direction : undefined;
    const account = typeof b.account === "string" ? b.account : undefined;
    const amount = b.amount;
    const currency = typeof b.currency === "string" ? b.currency : "NGN";
    const description =
      typeof b.description === "string" ? b.description : undefined;
    const occurredAt = b.occurredAt;
    const metadata =
      b.metadata && typeof b.metadata === "object"
        ? (b.metadata as Record<string, unknown>)
        : undefined;

    if (!referenceId || !direction || !account || amount === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: referenceId, direction, account, amount",
        },
        { status: 400 }
      );
    }

    if (!["debit", "credit"].includes(direction)) {
      return NextResponse.json(
        { success: false, error: "Direction must be 'debit' or 'credit'" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: { id: string; referenceId: string; entryId: string };
      error?: string;
    }>(`${backendBase()}/api/ledger/journal-entries`, {
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
    });

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ledger/journal-entries",
      operation: "POST",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
