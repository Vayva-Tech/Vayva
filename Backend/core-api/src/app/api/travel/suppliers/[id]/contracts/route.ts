import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ContractQuerySchema = z.object({
  status: z.enum(["active", "expired", "terminated"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPLIERS_VIEW,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const { searchParams } = new URL(req.url);

      const parseResult = ContractQuerySchema.safeParse(
        Object.fromEntries(searchParams),
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { status, page, limit } = parseResult.data;
      const skip = (page - 1) * limit;

      const supplier = await prisma.travelSupplier.findFirst({
        where: { id, storeId },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const where: {
        supplierId: string;
        supplier: { storeId: string };
        status?: string;
      } = {
        supplierId: id,
        supplier: { storeId },
      };
      if (status) where.status = status;

      const [contracts, total] = await Promise.all([
        prisma.travelSupplierContract.findMany({
          where,
          include: {
            supplier: {
              select: {
                name: true,
                contactEmail: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.travelSupplierContract.count({ where }),
      ]);

      return NextResponse.json(
        {
          data: contracts,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: supplierId } = await params;
      logger.error("[TRAVEL_SUPPLIER_CONTRACTS_GET]", { error, supplierId });
      return NextResponse.json(
        { error: "Failed to fetch supplier contracts" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
