import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import { prisma } from "@vayva/db";
import { z } from "zod";

const ExportSchema = z.object({
  type: z.enum(["orders", "inventory", "customers", "products", "transfers"]),
  format: z.enum(["csv", "json"]),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  filters: z.record(z.any()).optional(),
  columns: z.array(z.string()).optional(),
});

// GET /api/retail/export - Get export metadata
export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_INVENTORY_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      // Return available export types and columns
      const exportConfig = {
        orders: {
          columns: [
            { key: "orderNumber", label: "Order #" },
            { key: "customerName", label: "Customer" },
            { key: "email", label: "Email" },
            { key: "channel", label: "Channel" },
            { key: "status", label: "Status" },
            { key: "totalAmount", label: "Amount" },
            { key: "createdAt", label: "Date" },
          ],
        },
        inventory: {
          columns: [
            { key: "productName", label: "Product" },
            { key: "sku", label: "SKU" },
            { key: "quantity", label: "Current Stock" },
            { key: "reorderPoint", label: "Reorder Point" },
            { key: "status", label: "Status" },
            { key: "lastRestocked", label: "Last Restocked" },
          ],
        },
        customers: {
          columns: [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "totalOrders", label: "Orders" },
            { key: "totalSpent", label: "Total Spent" },
            { key: "loyaltyPoints", label: "Loyalty Points" },
          ],
        },
      };

      return NextResponse.json(
        {
          success: true,
          data: { exportConfig },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Get export config error:", error);
      return NextResponse.json(
        { error: "Failed to fetch export configuration" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// POST /api/retail/export - Generate export file
export const POST = withVayvaAPI(
  PERMISSIONS.RETAIL_INVENTORY_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const body = await req.json();
      const result = ExportSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid request",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { type, format, dateRange, filters, columns } = result.data;

      // Fetch data based on type
      let data: any[] = [];
      let columnConfig: Array<{ key: string; label: string }> = [];

      switch (type) {
        case "orders":
          data = await fetchOrders(storeId, dateRange, filters);
          columnConfig = [
            { key: "orderNumber", label: "Order #" },
            { key: "customerName", label: "Customer" },
            { key: "email", label: "Email" },
            { key: "channel", label: "Channel" },
            { key: "status", label: "Status" },
            { key: "totalAmount", label: "Amount" },
            { key: "createdAt", label: "Date" },
          ];
          break;

        case "inventory":
          data = await fetchInventory(storeId, filters);
          columnConfig = [
            { key: "productName", label: "Product" },
            { key: "sku", label: "SKU" },
            { key: "quantity", label: "Current Stock" },
            { key: "reorderPoint", label: "Reorder Point" },
            { key: "status", label: "Status" },
          ];
          break;

        case "customers":
          data = await fetchCustomers(storeId, filters);
          columnConfig = [
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "totalOrders", label: "Orders" },
            { key: "totalSpent", label: "Total Spent" },
          ];
          break;

        default:
          return NextResponse.json(
            { error: `Unsupported export type: ${type}` },
            { status: 400, headers: standardHeaders(requestId) },
          );
      }

      // Filter columns if specified
      if (columns) {
        columnConfig = columnConfig.filter((col) => columns.includes(col.key));
      }

      // Generate CSV
      if (format === "csv") {
        const csv = generateCSV(data, columnConfig);
        
        return new NextResponse(csv, {
          status: 200,
          headers: {
            ...standardHeaders(requestId),
            "Content-Type": "text/csv;charset=utf-8;",
            "Content-Disposition": `attachment; filename="${type}-export-${Date.now()}.csv"`,
          },
        });
      }

      // Return JSON
      return NextResponse.json(
        {
          success: true,
          data: {
            items: data,
            columns: columnConfig,
            count: data.length,
          },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Export error:", error);
      return NextResponse.json(
        { error: "Failed to generate export" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// Helper functions
async function fetchOrders(
  storeId: string,
  dateRange?: { from?: string; to?: string },
  filters?: any
) {
  const where: any = { storeId };

  if (dateRange?.from || dateRange?.to) {
    where.createdAt = {};
    if (dateRange.from) where.createdAt.gte = new Date(dateRange.from);
    if (dateRange.to) where.createdAt.lte = new Date(dateRange.to);
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.channel) {
    where.channel = filters.channel;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1000, // Limit for export
  });

  return orders.map((order) => ({
    orderNumber: order.orderNumber,
    customerName: order.customer?.name || "Guest",
    email: order.customer?.email || order.email,
    channel: order.channel,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
  }));
}

async function fetchInventory(storeId: string, filters?: any) {
  const where: any = { storeId };

  if (filters?.lowStock) {
    where.quantity = { lte: prisma.inventoryItem.fields.reorderPoint };
  }

  const inventory = await prisma.inventoryItem.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { product: { name: "asc" } },
    take: 1000,
  });

  return inventory.map((item) => ({
    productName: item.product?.name || "Unknown",
    sku: item.sku,
    quantity: item.quantity,
    reorderPoint: item.reorderPoint,
    status: item.quantity <= item.reorderPoint ? "Low Stock" : "In Stock",
    lastRestocked: item.lastRestocked?.toISOString() || null,
  }));
}

async function fetchCustomers(storeId: string, filters?: any) {
  const customers = await prisma.customer.findMany({
    where: { storeId },
    include: {
      loyaltyMember: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  return customers.map((customer) => ({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    totalOrders: customer._count.orders,
    totalSpent: customer.totalSpent || 0,
    loyaltyPoints: customer.loyaltyMember?.points || 0,
  }));
}

function generateCSV(
  data: any[],
  columns: Array<{ key: string; label: string }>
): string {
  const headers = columns.map((col) => col.label).join(",");
  
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        // Escape quotes and handle special characters
        const escaped = String(value || "").replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",")
  );

  return [headers, ...rows].join("\n");
}
