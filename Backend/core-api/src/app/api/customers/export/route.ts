import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const exportQuerySchema = z.object({
  format: z.enum(["csv", "json"]).default("csv"),
  segment: z.string().optional(),
});

// GET /api/customers/export - Export customers
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { format, segment } = exportQuerySchema.parse(
        Object.fromEntries(searchParams)
      );

      // Build query
      let customerIds: string[] | undefined;
      if (segment) {
        const memberships = await prisma.customerSegmentMembership?.findMany({
          where: { segmentId: segment },
          select: { customerId: true },
        });
        customerIds = memberships?.map((m) => m.customerId) || [];
        if (customerIds.length === 0) {
          return NextResponse.json(
            { error: "No customers found in segment" },
            { status: 404 }
          );
        }
      }

      const where = {
        storeId,
        ...(customerIds && { id: { in: customerIds } }),
      };

      const customers = await prisma.customer.findMany({
        where,
        include: {
          orders: {
            select: {
              total: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
          addresses: {
            where: { isDefault: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (format === "json") {
        return NextResponse.json(
          { data: customers },
          {
            headers: {
              "Content-Disposition": `attachment; filename="customers-${storeId}.json"`,
            },
          }
        );
      }

      // CSV format
      const headers = [
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Notes",
        "Tags",
        "Total Orders",
        "Total Spend",
        "Last Order Date",
        "Created At",
        "Default Address",
      ];

      const escapeCsv = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = customers.map((c) => {
        const totalSpend = c.orders.reduce(
          (sum, o) => sum + Number(o.total),
          0
        );
        const lastOrder = c.orders[0];
        const defaultAddress = c.addresses[0];

        return [
          c.id,
          c.firstName || "",
          c.lastName || "",
          c.email || "",
          c.phone || "",
          c.notes || "",
          c.tags?.join("; ") || "",
          c.orders.length,
          totalSpend,
          lastOrder?.createdAt.toISOString() || "",
          c.createdAt.toISOString(),
          defaultAddress
            ? `${defaultAddress.addressLine1}, ${defaultAddress.city}, ${defaultAddress.state}`
            : "",
        ].map(escapeCsv);
      });

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="customers-${storeId}.csv"`,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }
      logger.error("[CUSTOMERS_EXPORT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to export customers" },
        { status: 500 }
      );
    }
  }
);
