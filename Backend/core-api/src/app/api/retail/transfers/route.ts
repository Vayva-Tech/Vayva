import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { RetailApiService } from "@vayva/industry-retail";

const CreateTransferSchema = z.object({
  toStoreId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().min(1),
    })
  ),
  notes: z.string().optional(),
  priority: z.enum(["normal", "urgent"]).optional(),
});

// GET /api/retail/transfers - Get pending transfers
export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_TRANSFERS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const retailApi = new RetailApiService();
      const transfers = await retailApi.getTransfers(storeId);
      
      return NextResponse.json(
        {
          success: true,
          data: { transfers },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Get transfers error:", error);
      return NextResponse.json(
        { error: "Failed to fetch transfers" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// POST /api/retail/transfers - Create a new transfer
export const POST = withVayvaAPI(
  PERMISSIONS.RETAIL_TRANSFERS_MANAGE,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const body = await req.json();
      const result = CreateTransferSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { toStoreId, items, notes, priority } = result.data;
      const retailApi = new RetailApiService();
      
      const transfer = await retailApi.createTransfer(storeId, {
        fromStoreId: storeId,
        toStoreId,
        items,
        notes,
        priority,
      });
      
      return NextResponse.json(
        { 
          success: true, 
          message: "Transfer created successfully",
          data: { transfer },
        },
        { status: 201, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Create transfer error:", error);
      return NextResponse.json(
        { 
          error: "Failed to create transfer",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
