import { NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

type DispatchJobWithShipment = Prisma.DispatchJobGetPayload<{
  include: {
    shipment: {
      include: {
        order: { select: { orderNumber: true } };
      };
    };
  };
}>;

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [dispatchJobs, total] = await Promise.all([
      prisma.dispatchJob.findMany({
        where: { storeId: id },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          shipment: {
            include: {
              order: { select: { orderNumber: true } },
            },
          },
        },
      }),
      prisma.dispatchJob.count({ where: { storeId: id } }),
    ]);

    return NextResponse.json({
      data: dispatchJobs.map((job: DispatchJobWithShipment) => ({
        id: job.id,
        orderId: job.shipment?.order?.orderNumber,
        carrier: job.carrier,
        status: job.status,
        rider: job.assignedRiderName,
        riderPhone: job.assignedRiderPhone,
        createdAt: job.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
