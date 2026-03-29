import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { WhatsAppAgentService } from "@/services/whatsapp-agent.service";
import { z } from "zod";
import { handleApiError } from "@/lib/api-error-handler";

const CreateTemplateSchema = z.object({
  name: z.string().min(1),
  language: z.string().default("en"),
  category: z.string().default("UTILITY"),
  status: z.string().default("PENDING"),
  components: z.array(z.unknown()).optional(),
});

export const POST = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json().catch(() => ({}));
      const validation = CreateTemplateSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid input", details: validation.error },
          { status: 400 },
        );
      }
      const template = await WhatsAppAgentService.createTemplate(storeId, validation.data);
      return NextResponse.json(template);
    } catch (error: unknown) {
      handleApiError(error, {
        endpoint: "/settings/whatsapp/templates",
        operation: "POST_WHATSAPP",
        storeId,
      });
      throw error;
    }
  },
);
