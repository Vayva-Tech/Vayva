import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const accommodationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["room", "suite", "villa", "apartment"]),
  description: z.string().min(10).max(2000),
  maxGuests: z.number().int().min(1).max(20),
  bedConfiguration: z.string(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  basePrice: z.number().positive(),
  cleaningFee: z.number().min(0).default(0),
  serviceFee: z.number().min(0).default(0),
});

/**
 * GET /api/stays/accommodations
 * List accommodations for a store
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");
    const isActive = searchParams.get("isActive");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID required" },
        { status: 400 }
      );
    }

    // Call backend API to fetch accommodations
    const result = await apiJson<{
      accommodations: Array<{
        id: string;
        name: string;
        type: string;
        description: string;
        maxGuests: number;
        bedConfiguration: string;
        amenities: string[];
        images: string[];
        basePrice: number;
        cleaningFee: number;
        serviceFee: number;
        isActive: boolean;
        createdAt: Date;
      }>;
    }>(
      `${process.env.BACKEND_API_URL}/api/stays/accommodations?storeId=${storeId}&isActive=${isActive || ''}`,
      {
        headers: {},
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/stays/accommodations",
        operation: "GET_ACCOMMODATIONS",
        storeId: undefined,
      }
    );
    throw error;
  }
}
