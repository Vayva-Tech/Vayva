import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

type TxWithStore = Prisma.PaymentTransactionGetPayload<{
  include: { store: { select: { name: true; slug: true } } };
}>;

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!user || !["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const q = (searchParams.get("q") || "").trim();
    const storeId = (searchParams.get("storeId") || "").trim();

    const skip = (page - 1) * limit;

    const where: Prisma.PaymentTransactionWhereInput = {
      AND: [
        { type: "WALLET_FUNDING" },
        { provider: "paystack" },
        storeId ? { storeId } : {},
        q
          ? {
              OR: [
                { reference: { contains: q, mode: "insensitive" } },
                { store: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
      ],
    };

    const [items, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: { store: { select: { name: true, slug: true } } },
      }),
      prisma.paymentTransaction.count({ where }),
    ]);

    const data = (items as TxWithStore[]).map((t: any) => ({
      id: t.id,
      storeId: t.storeId,
      storeName: t.store?.name || "Unknown",
      storeSlug: t.store?.slug,
      reference: t.reference,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      createdAt: t.createdAt,
      metadata: t.metadata,
    }));

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error("[OPS_WALLET_FUNDING_LIST_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
