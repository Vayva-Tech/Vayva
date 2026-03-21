// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/nonprofit/donations?storeId=xxx&campaignId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId") ?? req.headers.get("x-store-id") ?? "";
    const campaignId = searchParams.get("campaignId");
    const donorId = searchParams.get("donorId");
    const status = searchParams.get("status");

    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }

    // Fetch donations via backend API
    const queryParams = new URLSearchParams({ storeId });
    if (campaignId) queryParams.append("campaignId", campaignId);
    if (donorId) queryParams.append("donorId", donorId);
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/nonprofit/donations?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch donations");
    }

    return NextResponse.json({ donations: result.data || [] });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/nonprofit/donations",
      operation: "FETCH_DONATIONS",
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
  try {
    const storeId = req.headers.get("x-store-id") || "";
    const body = await req.json();
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
    } = body;

    const bodyStoreId = body.storeId || storeId;

    if (!bodyStoreId || !donorEmail || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await apiJson<{ success: boolean; data?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/nonprofit/donations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": bodyStoreId,
        },
        body: JSON.stringify({
          campaignId,
          storeId: bodyStoreId,
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create donation", message: errorMessage },
      { status: 500 }
    );
  }
}
