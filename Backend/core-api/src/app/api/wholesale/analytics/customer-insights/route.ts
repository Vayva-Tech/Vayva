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
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get customer counts
      const [totalAccounts, activeAccounts, newThisMonth] = await Promise.all([
        prisma.wholesaleCustomer.count({ where: { storeId } }),
        prisma.wholesaleCustomer.count({ 
          where: { 
            storeId, 
            orders: { some: { createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } } 
          } 
        }),
        prisma.wholesaleCustomer.count({ 
          where: { 
            storeId, 
            createdAt: { gte: monthStart } 
          } 
        })
      ]);

      // Get top customers by revenue (last 30 days)
      const topCustomers = await prisma.wholesaleCustomer.findMany({
        where: { storeId },
        include: {
          orders: {
            where: {
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              status: { not: "cancelled" }
            },
            select: { totalAmount: true }
          }
        },
        orderBy: { orders: { _count: "desc" } },
        take: 10
      });

      // Transform to required format
      const topCustomersFormatted = topCustomers.map((customer, _index) => ({
        id: customer.id,
        name: customer.companyName,
        revenue: customer.orders.reduce((sum, order) => sum + order.totalAmount, 0),
        orderCount: customer.orders.length,
        percentageOfTotal: Math.round((customer.orders.length / Math.max(topCustomers.reduce((sum, c) => sum + c.orders.length, 0), 1)) * 100)
      }));

      // Calculate customer metrics
      const totalCustomerOrders = topCustomers.reduce((sum, customer) => sum + customer.orders.length, 0);
      const customerLifetimeValue = 47000; // Demo value - would calculate from historical data
      const avgOrderFrequency = totalCustomerOrders > 0 
        ? totalCustomerOrders / topCustomers.length 
        : 0;

      // Calculate at-risk accounts (simplified)
      const atRiskAccounts = await prisma.wholesaleCustomer.count({
        where: {
          storeId,
          orders: {
            every: {
              createdAt: { lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } // No orders in 6 months
            }
          }
        }
      });

      const customerInsights = {
        totalAccounts,
        activeAccounts,
        newThisMonth,
        atRiskAccounts,
        topCustomers: topCustomersFormatted,
        customerLifetimeValue,
        avgOrderFrequency,
      };

      return NextResponse.json(
        { data: customerInsights },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_CUSTOMER_INSIGHTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch customer insights data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);