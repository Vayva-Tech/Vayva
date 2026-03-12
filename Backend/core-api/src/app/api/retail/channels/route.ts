import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { RetailApiService } from "@vayva/industry-retail";

// GET /api/retail/channels - Get all sales channels
export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_CHANNELS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const retailApi = new RetailApiService();
      const channels = await retailApi.getChannels(storeId);
      
      return NextResponse.json(
        {
          success: true,
          data: { channels },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Get channels error:", error);
      return NextResponse.json(
        { error: "Failed to fetch channels" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
