import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status !== "ALL") where.status = status;

  const withdrawals = await prisma.withdrawal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          bankBeneficiaries: {
            where: { isDefault: true },
            take: 1,
          },
          walletPin: true, // Check for security (existence or changedAt if we added that, current schema only has string)
        },
      },
    },
    take: 100,
  });

  // Handle BigInt serialization & Attach Bank Details
  const data = withdrawals.map((w) => {
    const bank = w.store.bankBeneficiaries[0];
    return {
      ...w,
      amountKobo: w.amountKobo?.toString() ?? "0",
      feeKobo: w.feeKobo?.toString() ?? "0",
      amountNetKobo: w.amountNetKobo?.toString() ?? "0",
      feePercent: w.feePercent?.toString() ?? "0",
      // Flatten bank details for UI
      bankDetails: bank
        ? {
            bankName: bank.bankName,
            accountNumber: bank.accountNumber,
            accountName: bank.accountName,
          }
        : null,
      hasWalletPin: !!w.store.walletPin,
    };
  });

  return NextResponse.json({ data });
}
