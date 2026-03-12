import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { RetailInventoryService } from "@vayva/industry-retail";

const InventoryAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  adjustment: z.object({
    type: z.enum(['set', 'add', 'remove']),
    quantity: z.number().min(0),
    reason: z.enum(['sale', 'return', 'damage', 'restock', 'transfer', 'correction']),
    notes: z.string().optional(),
  }),
});

// GET /api/retail/inventory/alerts - Get inventory alerts
export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_INVENTORY_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const inventoryService = new RetailInventoryService();
      const alerts = await inventoryService.getInventoryAlerts(storeId, {
        defaultThreshold: 10,
        alertRecipients: [],
        autoReorderEnabled: false,
      });
      
      const lowStockSummary = await inventoryService.getLowStockSummary(storeId);
      
      return NextResponse.json(
        {
          success: true,
          data: {
            alerts,
            summary: lowStockSummary,
          },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Inventory alerts error:", error);
      return NextResponse.json(
        { error: "Failed to fetch inventory alerts" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// POST /api/retail/inventory/adjust - Adjust inventory levels
export const POST = withVayvaAPI(
  PERMISSIONS.RETAIL_INVENTORY_EDIT,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const body = await req.json();
      const result = InventoryAdjustmentSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { productId, adjustment } = result.data;
      const inventoryService = new RetailInventoryService();
      
      await inventoryService.adjustInventory(storeId, productId, adjustment);
      
      return NextResponse.json(
        { 
          success: true, 
          message: "Inventory adjusted successfully",
          data: { productId, ...adjustment }
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Inventory adjustment error:", error);
      return NextResponse.json(
        { 
          error: "Failed to adjust inventory",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
