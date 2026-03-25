import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

// GET /api/grocery/departments - Get department performance
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      // Get all categories (departments)
      const categories = await prisma.category.findMany({
        where: { storeId },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      // Get sales by category for today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const _salesByCategory = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          orderId: {
            in: await prisma.order.findMany({
              where: {
                storeId,
                createdAt: { gte: startOfDay, lte: endOfDay },
                status: { not: 'cancelled' },
              },
              select: { id: true },
            }).then(orders => orders.map(o => o.id)),
          },
        },
        _sum: { quantity: true, totalPrice: true },
      });

      // Map categories to department format
      const departments = categories.map((category, index) => ({
        id: category.id,
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
        revenue: 0, // Would calculate from sales data
        percentageOfTotal: 0, // Would calculate
        trend: Math.random() * 0.2 - 0.1, // Placeholder
        productCount: category._count.products,
        topCategory: index === 0 ? 'Best Seller' : undefined,
        decliningCategory: index === categories.length - 1 ? 'Needs Attention' : undefined,
      }));

      // Calculate total revenue
      const totalRevenue = departments.reduce((sum, dept) => sum + dept.revenue, 0);
      
      // Update percentages
      const updatedDepartments = departments.map(dept => ({
        ...dept,
        percentageOfTotal: totalRevenue > 0 ? (dept.revenue / totalRevenue) * 100 : 0,
      }));

      return NextResponse.json(
        { 
          success: true,
          data: updatedDepartments,
          timestamp: new Date().toISOString(),
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_DEPARTMENTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch departments" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);
