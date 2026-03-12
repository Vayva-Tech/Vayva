import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { z } from "zod";

const TemplateSwitchSchema = z.object({
  templateId: z.string(),
  confirmed: z.boolean().optional(),
});

// POST /api/billing/template-switch - Check billing requirements for template switch
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const validated = TemplateSwitchSchema.parse(body);

      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/billing/template-switch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify(validated),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to process template switch" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to process template switch" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[BILLING_TEMPLATE_SWITCH_ERROR] Failed to process template switch", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to process template switch" },
        { status: 500 }
      );
    }
  }
);
