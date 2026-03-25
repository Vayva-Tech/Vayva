import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Used by merchant BFF checkout verify for idempotent retries.
 * Always 200 so `apiJson` does not throw when no row exists yet.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ reference: string }> },
): Promise<NextResponse> {
  const { reference: raw } = await ctx.params;
  const reference = decodeURIComponent(raw);

  const tx = await prisma.paymentTransaction.findUnique({
    where: { reference },
    include: { store: { select: { id: true, name: true } } },
  });

  if (!tx) {
    return NextResponse.json(
      { success: true, data: {} },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        storeId: tx.storeId,
        metadata: tx.metadata,
        store: { name: tx.store.name },
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
