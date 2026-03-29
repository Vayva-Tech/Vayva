import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/loyalty/program — store from session only
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;
    if (!session?.user || !storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch loyalty program via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/loyalty/program?storeId=${encodeURIComponent(storeId)}`, {
      headers: { "x-store-id": storeId },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch loyalty program');
    }

    return NextResponse.json({ program: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/loyalty/program",
        operation: "FETCH_LOYALTY_PROGRAM",
      }
    );
    return NextResponse.json({ error: "Failed to fetch loyalty program" }, { status: 500 });
  }
}

// POST /api/loyalty/program - Update loyalty program
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const storeId = session?.user?.storeId;
    if (!session?.user || !storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId: _bodyStoreId, ...input } = body;

    // Update loyalty program via API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/loyalty/program`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(input),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update loyalty program');
    }

    return NextResponse.json({ program: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/loyalty/program",
        operation: "UPDATE_LOYALTY_PROGRAM",
      }
    );
    return NextResponse.json({ error: "Failed to update loyalty program" }, { status: 500 });
  }
}
