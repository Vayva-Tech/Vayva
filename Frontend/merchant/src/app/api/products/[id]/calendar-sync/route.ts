import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Product id required" }, { status: 400 });
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json().catch(() => ({}));
    const rec = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
    const name = String(rec.name ?? "").trim();
    const url = String(rec.url ?? "").trim();

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
    }>(`${process.env.BACKEND_API_URL}/api/products/${id}/calendar-sync`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({ name, url }),
    });

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/products/[id]/calendar-sync",
      operation: "ADD_CALENDAR_SYNC",
    });
    return NextResponse.json(
      { error: "Failed to add calendar sync" },
      { status: 500 },
    );
  }
}
