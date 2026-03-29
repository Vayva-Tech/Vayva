import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const servicePackageSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  services: z.array(z.object({
    serviceId: z.string(),
    quantity: z.number().int().min(1).default(1),
  })).min(1),
  totalSessions: z.number().int().min(1),
  validityDays: z.number().int().min(1),
  price: z.number().positive(),
  savings: z.number().min(0).default(0),
});

/**
 * GET /api/services/packages?storeId=xxx&isActive=xxx
 * List service packages for a store
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");

    // Call backend API to fetch service packages
    const result = await apiJson<{
      packages: Array<{
        id: string;
        name: string;
        description: string;
        services: Array<{ serviceId: string; quantity: number }>;
        totalSessions: number;
        validityDays: number;
        price: number;
        savings: number;
        isActive: boolean;
      }>;
      stats: {
        total: number;
        active: number;
        inactive: number;
      };
    }>(
      `${process.env.BACKEND_API_URL}/api/services/packages?storeId=${encodeURIComponent(storeId)}&isActive=${isActive || ''}`,
      {
        headers: auth.headers,
      },
    );
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/services/packages",
        operation: "GET_SERVICE_PACKAGES",
        storeId: undefined,
      }
    );
    throw error;
  }
}
