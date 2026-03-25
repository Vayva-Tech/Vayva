import { NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";

export async function GET() {
  try {
    const data = await apiJson("/system/incidents/active", { method: "GET" });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // If backend unreachable, return no active incidents (non-critical)
    return NextResponse.json({ incidents: [] }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
