import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const profile = await apiJson(
      `${process.env.BACKEND_API_URL}/api/users/me`,
      {
        headers: { "x-store-id": storeId },
      }
    );
    return NextResponse.json(profile, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/settings/profile", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const { firstName, lastName, phone } = body as Record<string, unknown>;

    if (!firstName && !lastName && !phone) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 }
      );
    }

    const result = await apiJson<{ success: boolean }>(
      `${process.env.BACKEND_API_URL}/api/users/me`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-store-id": storeId },
        body: JSON.stringify({
          ...(typeof firstName === "string" ? { firstName } : {}),
          ...(typeof lastName === "string" ? { lastName } : {}),
          ...(typeof phone === "string" ? { phone } : {}),
        }),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/settings/profile", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
