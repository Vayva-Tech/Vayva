import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      // Get all inventory items
      const inventoryItems = await prisma.wholesaleInventory.findMany({
        where: { storeId },
        include: {
          product: { select: { name: true, sku: true } }
        }
      });

      // Calculate inventory metrics
      let inStock = 0;
      let lowStock = 0;
      let outOfStock = 0;
      let overstocked = 0;
      let totalCarryingCost = 0;

      inventoryItems.forEach(item => {
        const availableStock = item.currentStock - item.reservedStock;
        
        if (availableStock <= 0) {
          outOfStock++;
        } else if (availableStock <= item.reorderPoint) {
          lowStock++;
        } else if (availableStock > item.maxStock * 0.8) {
          overstocked++;
        } else {
          inStock++;
        }

        // Assuming $10 average carrying cost per unit
        totalCarryingCost += availableStock * 10;
      });

      // Calculate inventory turnover (simplified)
      const totalInventoryValue = inventoryItems.reduce((sum, item) => 
        sum + (item.currentStock * 10), 0); // Assuming $10 average cost
      
      // Simplified turnover calculation - would need actual COGS data
      const inventoryTurnoverDays = 32; // Demo value
      
      // Fill rate calculation (simplified)
      const fillRate = 96.8; // Demo value - would calculate from fulfilled vs requested orders

      const inventoryHealth = {
        inStock,
        lowStock,
        outOfStock,
        overstocked,
        inventoryTurnoverDays,
        fillRate,
        carryingCost: totalCarryingCost,
      };

      return NextResponse.json(
        { data: inventoryHealth },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_INVENTORY_HEALTH_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch inventory health data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);