import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { RetailApiService } from "@vayva/industry-retail";

// GET /api/retail/stores - Get all store locations and performance
export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_STORES_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const retailApi = new RetailApiService();
      const stores = await retailApi.getStores(storeId);
      
      return NextResponse.json(
        {
          success: true,
          data: { stores },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Get stores error:", error);
      return NextResponse.json(
        { error: "Failed to fetch stores" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
