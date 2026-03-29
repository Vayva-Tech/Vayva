import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const checkInSchema = z.object({
  orderId: z.string(),
  ticketId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  ticketTier: z.string(),
  seatAssigned: z.string().optional(),
  plusOnes: z.number().int().min(0).max(10).default(0),
  entryMethod: z.enum(["scan", "manual", "nfc"]).default("scan"),
  notes: z.string().optional(),
});

/**
 * GET /api/events/check-in?eventId=xxx
 * Get check-in list for an event
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const dateFrom = searchParams.get("dateFrom");
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    // Call backend API to fetch check-ins
    const result = await apiJson<{
      checkIns: Array<{
        id: string;
        ticketId: string;
        customerName: string;
        checkedInAt: Date;
        seatAssigned: string | null;
      }>;
      total: number;
      stats: {
        totalCheckedIn: number;
        totalRegistered: number;
        checkInRate: number;
      };
    }>(
      `${process.env.BACKEND_API_URL}/api/events/check-in?eventId=${eventId}&dateFrom=${dateFrom || ''}&limit=${limit}&offset=${offset}`,
      {
        headers: auth.headers,
      },
    );
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/events/check-in",
        operation: "GET_CHECK_INS",
        storeId: undefined,
      }
    );
    throw error;
  }
}
