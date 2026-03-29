import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/nonprofit/donations?storeId=xxx&campaignId=xxx
export async function GET(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const donorId = searchParams.get("donorId");
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams({ storeId });
    if (campaignId) queryParams.append("campaignId", campaignId);
    if (donorId) queryParams.append("donorId", donorId);
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${buildBackendUrl("/nonprofit/donations")}?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch donations");
    }

    return NextResponse.json({ donations: result.data || [] });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/nonprofit/donations",
      operation: "FETCH_DONATIONS",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch donations", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/nonprofit/donations
export async function POST(req: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const {
      campaignId,
      donorId,
      donorEmail,
      donorName,
      amount,
      currency,
      isAnonymous,
      message,
      recurring,
      frequency,
      paymentMethod,
    } = b;

    if (
      typeof donorEmail !== "string" ||
      donorEmail.length === 0 ||
      amount === undefined ||
      amount === null ||
      typeof paymentMethod !== "string" ||
      paymentMethod.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await apiJson<{ success: boolean; data?: unknown; error?: string }>(
      buildBackendUrl("/nonprofit/donations"),
      {
        method: "POST",
        headers: {
          ...auth.headers,
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({
          campaignId,
          storeId,
          donorId,
          donorEmail,
          donorName,
          amount,
          currency,
          isAnonymous,
          message,
          recurring,
          frequency,
          paymentMethod,
        }),
      }
    );

    return NextResponse.json({ donation: result.data }, { status: 201 });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/nonprofit/donations",
      operation: "CREATE_DONATION",
      storeId,
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create donation", message: errorMessage },
      { status: 500 }
    );
  }
}
