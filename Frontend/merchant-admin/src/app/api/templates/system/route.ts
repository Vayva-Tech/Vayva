import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders, SYSTEM_TEMPLATES, SYSTEM_TEMPLATE_COUNT } from "@vayva/shared";

export const GET = withVayvaAPI(PERMISSIONS.STOREFRONT_VIEW, async (_req: NextRequest, { correlationId }: { correlationId: string }) => {
  return NextResponse.json(
    {
      success: true,
      data: SYSTEM_TEMPLATES,
      meta: { count: SYSTEM_TEMPLATE_COUNT },
      requestId: correlationId,
    },
    { headers: standardHeaders(correlationId) },
  );
});
