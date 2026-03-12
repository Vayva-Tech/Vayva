import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { z } from "zod";

const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  isSystem: z.boolean().default(false),
  config: z.record(z.any()).optional(),
});

/**
 * GET /api/templates
 * List all available templates (system + merchant custom)
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get("category");
      const includeSystem = searchParams.get("includeSystem") !== "false";

      // Build query params
      const queryParams = new URLSearchParams();
      if (category) queryParams.set("category", category);
      queryParams.set("includeSystem", includeSystem.toString());

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/templates?${queryParams}`,
        {
          headers: {
            "x-merchant-id": session.merchantId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch templates" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to fetch templates" },
        };
      }

      const templates = await backendResponse.json();

      return {
        status: 200,
        body: { templates },
      };
    },
    { requireAuth: true }
  );
}
