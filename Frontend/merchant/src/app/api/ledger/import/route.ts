import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      const result = await apiJson(`${buildBackendUrl("/ledger/import")}`,
      {
          method: "POST",
          headers: {
            ...auth.headers,
            "x-user-id": auth.user.id,
          },
          body: JSON.stringify({
            entries,
            format,
            importedBy: auth.user.id,
            importedByEmail: auth.user.email,
          }),
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/ledger/import", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
