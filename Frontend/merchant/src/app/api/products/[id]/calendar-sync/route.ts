// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const url = String(body?.url || "").trim();

    if (!name || !url) {
      return NextResponse.json({ error: "name and url are required" }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const result = await apiJson<{
      id: string;
      name: string;
      url: string;
      lastSyncedAt: Date | null;
      syncStatus: string;
      error: string | null;
      createdAt: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/products/${id}/calendar-sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({ name, url }),
      }
    );
    
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/products/[id]/calendar-sync",
      operation: "ADD_CALENDAR_SYNC",
    });
    return NextResponse.json(
      { error: "Failed to add calendar sync" },
      { status: 500 }
    );
  }
}
