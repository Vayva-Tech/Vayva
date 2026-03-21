// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
      const { entries, format = "json" } = body;

      // Validate entries
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return NextResponse.json(
          { success: false, error: "Entries array is required" },
          { status: 400 }
        );
      }

      // Validate entry count
      if (entries.length > 1000) {
        return NextResponse.json(
          { success: false, error: "Maximum 1000 entries allowed per import" },
          { status: 400 }
        );
      }

      // Call backend API
      const result = await apiJson(`${process.env.BACKEND_API_URL}/api/endpoint`,
      {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            entries,
            format,
            importedBy: user.id,
            importedByEmail: user.email,
          }),
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/ledger/import", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
