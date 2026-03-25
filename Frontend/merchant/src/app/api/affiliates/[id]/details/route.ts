import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { id } = await params;

    const affiliate = await prisma.affiliate.findFirst({
      where: { id, storeId },
    });
    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    const [referrals, payouts, earnings] = await Promise.all([
      prisma.affiliateReferral.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.affiliatePayout.findMany({
        where: { affiliateId: affiliate.id, storeId },
        orderBy: { initiatedAt: "desc" },
        take: 100,
      }),
      prisma.affiliateEarning.findMany({
        where: { affiliateId: affiliate.id },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        email: affiliate.email,
        name: affiliate.name,
        phone: affiliate.phone ?? undefined,
        status: String(affiliate.status),
        kycStatus: String(affiliate.kycStatus),
        referralCode: affiliate.referralCode,
        commissionRate: Number(affiliate.commissionRate),
        commissionType: String(affiliate.commissionType || "percentage"),
        minimumPayout: Number(affiliate.minimumPayout),
        totalEarnings: Number(affiliate.totalEarnings),
        pendingEarnings: Number(affiliate.pendingEarnings),
        paidEarnings: Number(affiliate.paidEarnings),
        totalReferrals: affiliate.totalReferrals,
        totalConversions: affiliate.totalConversions,
        bankName: affiliate.bankName ?? undefined,
        accountNumber: affiliate.accountNumber ?? undefined,
        createdAt: affiliate.createdAt,
      },
      referrals: referrals.map((r) => ({
        id: r.id,
        customerId: r.customerId,
        orderId: r.orderId,
        orderAmount: r.orderAmount ? Number(r.orderAmount) : null,
        commission: Number(r.commission),
        status: String(r.status),
        createdAt: r.createdAt,
        convertedAt: r.convertedAt,
      })),
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        status: String(p.status),
        initiatedAt: p.initiatedAt,
        processedAt: p.processedAt,
        failedAt: p.failedAt,
        failureReason: p.failureReason,
        paystackTransferCode: p.paystackTransferCode,
      })),
      earnings: earnings.map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        type: e.type,
        status: String(e.status),
        orderId: e.orderId,
        createdAt: e.createdAt,
        paidAt: e.paidAt,
        payoutId: e.payoutId,
      })),
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/affiliates/:id/details",
      operation: "GET_AFFILIATE_DETAILS",
    });
    return NextResponse.json(
      { error: "Failed to fetch affiliate details" },
      { status: 500 },
    );
  }
}

