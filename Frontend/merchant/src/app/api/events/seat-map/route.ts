import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const seatMapSchema = z.object({
  eventId: z.string().uuid(),
  svgLayout: z.string().min(1),
  sections: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    priceMultiplier: z.number().min(0.1).max(10).default(1),
  })),
  seats: z.array(z.object({
    id: z.string(),
    section: z.string(),
    row: z.string(),
    number: z.string(),
    x: z.number(),
    y: z.number(),
    status: z.enum(["available", "reserved", "sold", "blocked"]).default("available"),
    ticketTierId: z.string().uuid().optional(),
  })),
});

/**
 * GET /api/events/seat-map?eventId=xxx
 * Get seat map for an event
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
    }

    // Call backend API to fetch seat map
    const result = await apiJson<{
      seatMap?: {
        eventId: string;
        svgLayout: string;
        sections: Array<{ id: string; name: string; color: string; priceMultiplier: number }>;
        seats: Array<{ id: string; section: string; row: string; number: string; x: number; y: number; status: string }>;
      };
      availability?: {
        totalSeats: number;
        availableSeats: number;
        reservedSeats: number;
        soldSeats: number;
      };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/events/seat-map?eventId=${eventId}`,
      {
        headers: {},
      }
    );
    
    if (result.error) {
      const status = result.error.includes("not found") ? 404 : 400;
      return NextResponse.json(result, { status });
    }
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/events/seat-map",
        operation: "GET_SEAT_MAP",
        storeId: undefined,
      }
    );
    throw error;
  }
}
