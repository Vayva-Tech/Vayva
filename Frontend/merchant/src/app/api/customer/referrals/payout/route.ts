import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/customer/referrals/payout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/customer/referrals/payout", operation: "POST" });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/customer/referrals/payout`, {
      headers: { "x-store-id": storeId },
    });
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/customer/referrals/payout", operation: "GET" });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
