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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const parseResult = ContractQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    const { status, page, limit } = parseResult.data;
    const skip = (page - 1) * limit;

    // Verify supplier exists
    const supplier = await prisma.travelSupplier.findFirst({
      where: { id, storeId },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    const where: any = { supplierId: id };
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
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[TRAVEL_SUPPLIER_CONTRACTS_GET]", { error, supplierId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch supplier contracts" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}