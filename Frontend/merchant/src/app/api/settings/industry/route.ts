// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      industrySlug: string | null;
      config: {
        displayName: string;
        primaryObject: string;
        modules: string[];
        moduleLabels: Record<string, string>;
      } | null;
    }>(
      `${process.env.BACKEND_API_URL}/api/settings/industry`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/settings/industry",
      operation: "GET_INDUSTRY_SETTINGS",
    });
    return NextResponse.json(
      { error: "Failed to fetch industry settings" },
      { status: 500 }
    );
  }
}
