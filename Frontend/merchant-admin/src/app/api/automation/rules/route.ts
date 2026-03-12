import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/automation/rules - Get automation rules
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/automation/rules`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch rules" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch rules" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[AUTOMATION_RULES_GET_ERROR]", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch automation rules" },
        { status: 500 }
      );
    }
  }
);

// POST /api/automation/rules - Create automation rule
export const POST = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/automation/rules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(body),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create rule" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create rule" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[AUTOMATION_RULES_POST_ERROR]", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create automation rule" },
        { status: 500 }
      );
    }
  }
);
