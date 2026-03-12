import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { RetailApiService } from "@vayva/industry-retail";

// GET /api/retail/loyalty - Get loyalty program statistics
export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_LOYALTY_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const retailApi = new RetailApiService();
      
      const stats = await retailApi.getLoyaltyStats(storeId);
      const members = await retailApi.getLoyaltyMembers(storeId, 50);
      const segments = await retailApi.getCustomerSegments(storeId);
      
      return NextResponse.json(
        {
          success: true,
          data: {
            stats,
            members,
            segments,
          },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Get loyalty data error:", error);
      return NextResponse.json(
        { error: "Failed to fetch loyalty data" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
