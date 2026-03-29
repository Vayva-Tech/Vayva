import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    const response = await apiClient.get('/api/v1/admin/search', { q: query });
    
    return NextResponse.json(response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
