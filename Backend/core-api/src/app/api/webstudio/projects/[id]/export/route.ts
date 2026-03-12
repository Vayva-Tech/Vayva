import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";

export const dynamic = "force-dynamic";

export const POST = withVayvaAPI(
  PERMISSIONS.TEMPLATES_MANAGE,
  async (_req: NextRequest, { correlationId }) => {
    return NextResponse.json(
      {
        success: false,
        error: "Export is not yet implemented (Phase 2)",
        requestId: correlationId,
      },
      { status: 501, headers: standardHeaders(correlationId) },
    );
  },
);
