import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders, SYSTEM_TEMPLATES } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.STOREFRONT_VIEW,
  async (_req, { correlationId }) => {
    return NextResponse.json(
      {
        success: true,
        data: SYSTEM_TEMPLATES,
        meta: { count: SYSTEM_TEMPLATES.length },
        requestId: correlationId,
      },
      { headers: standardHeaders(correlationId) },
    );
  },
);
