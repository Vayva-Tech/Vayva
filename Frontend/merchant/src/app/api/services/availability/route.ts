import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const availabilitySchema = z.object({
  serviceId: z.string(),
  staffId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().int().min(15).max(240),
  bufferMinutes: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/services/availability?serviceId=xxx&staffId=xxx
 * Get staff availability schedules
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    // Call backend API to fetch availability
    const result = await apiJson<{
      availability: Array<{
        id: string;
        serviceId: string;
        staffId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDuration: number;
        bufferMinutes: number;
        isActive: boolean;
      }>;
      groupedByStaff: Record<string, Array<unknown>>;
    }>(
      `${process.env.BACKEND_API_URL}/api/services/availability?serviceId=${serviceId || ''}&staffId=${staffId || ''}&dayOfWeek=${dayOfWeek || ''}`,
      {
        headers: auth.headers,
      },
    );
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/services/availability",
        operation: "GET_AVAILABILITY",
        storeId: undefined,
      }
    );
    throw error;
  }
}
