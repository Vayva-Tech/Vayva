import { prisma } from "@vayva/db";
import { Paystack } from "@vayva/payments";
import crypto from "crypto";

export interface Affiliate {
  id: string;
  userId: string;
  storeId: string;
  email: string;
  name: string;
  phone?: string;
  referralCode: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "INACTIVE";
  commissionRate: number;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  paystackRecipientCode?: string;
  kycStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: Date;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  orderId?: string;
  customerId: string;
  orderAmount?: number;
  commission: number;
  status: "PENDING" | "CONFIRMED" | "PAID" | "CANCELLED" | "REFUNDED";
  createdAt: Date;
  convertedAt?: Date;
}

export class AffiliateService {
  private readonly DEFAULT_COMMISSION_RATE = 0.1;

  async registerAffiliate(
    storeId: string,
    data: {
      email: string;
      name: string;
      phone?: string;
      userId?: string;
      bankCode?: string;
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      customCode?: string;
      commissionRate?: number;
    }
  ): Promise<Affiliate> {
    const existing = await prisma.affiliate.findFirst({
      where: { storeId, email: data.email },
    });

    if (existing) {
      throw new Error("Email is already registered as an affiliate for this store");
    }

    const referralCode = data.customCode || this.generateAffiliateCode();

    const codeExists = await prisma.affiliate.findFirst({
      where: { referralCode },
    });
    if (codeExists) {
      throw new Error("Affiliate code already in use");
    }

    let paystackRecipientCode: string | undefined;
    if (data.bankCode && data.accountNumber) {
      try {
        const recipient = await Paystack.createTransferRecipient({
          name: data.accountName || data.name,
          account_number: data.accountNumber,
          bank_code: data.bankCode,
          currency: "NGN",
        } as any);
        paystackRecipientCode = (recipient as any).recipient_code;
      } catch (error) {
        console.error("[Affiliate] Failed to create Paystack recipient:", error);
      }
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        storeId,
        userId: data.userId || null,
        email: data.email,
        name: data.name,
        phone: data.phone,
        referralCode,
        status: "PENDING",
        kycStatus: "PENDING",
        commissionRate: data.commissionRate || this.DEFAULT_COMMISSION_RATE,
        totalReferrals: 0,
        totalConversions: 0,
        bankCode: data.bankCode,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        paystackRecipientCode,
        preferredPayoutMethod: "bank_transfer",
      },
    });

    return this.mapAffiliate(affiliate);
  }

  async updateBankDetails(
    affiliateId: string,
    bankDetails: {
      bankCode: string;
      bankName: string;
      accountNumber: string;
      accountName: string;
    }
  ): Promise<Affiliate> {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    let paystackRecipientCode: string | undefined;
    try {
      const recipient = await Paystack.createTransferRecipient({
        name: bankDetails.accountName,
        account_number: bankDetails.accountNumber,
        bank_code: bankDetails.bankCode,
        currency: "NGN",
      } as any);
      paystackRecipientCode = (recipient as any).recipient_code;
    } catch (error) {
      console.error("[Affiliate] Failed to create Paystack recipient:", error);
      throw new Error("Failed to verify bank account. Please check the details and try again.");
    }

    const updated = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        bankCode: bankDetails.bankCode,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
        paystackRecipientCode,
      },
    });

    return this.mapAffiliate(updated);
  }

  async approveAffiliate(affiliateId: string, approvedBy: string): Promise<Affiliate> {
    const affiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        status: "ACTIVE",
        kycStatus: "VERIFIED",
        kycVerifiedAt: new Date(),
      },
    });

    return this.mapAffiliate(affiliate);
  }

  async processPayout(
    affiliateId: string,
    amount: number,
    method: "bank_transfer" | "wallet",
    processedBy: string,
    options?: {
      requiresApproval?: boolean;
      approvedBy?: string;
    }
  ): Promise<{ success: boolean; payoutId?: string; transferCode?: string; error?: string }> {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      return { success: false, error: "Affiliate not found" };
    }

    const pendingEarnings = Number(affiliate.pendingEarnings);
    if (pendingEarnings < amount) {
      return { success: false, error: "Insufficient pending balance" };
    }

    if (method === "bank_transfer" && !affiliate.paystackRecipientCode) {
      return { success: false, error: "Bank account not configured" };
    }

    const requiresApproval = options?.requiresApproval || amount > 100000;

    const pendingEarningsList = await prisma.affiliateEarning.findMany({
      where: {
        affiliateId,
        status: "pending",
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    const earningIds = pendingEarningsList.map(e => e.id);

    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId,
        storeId: affiliate.storeId,
        amount,
        fee: 0,
        netAmount: amount,
        status: requiresApproval ? "APPROVAL_REQUIRED" : "PENDING",
        requiresApproval,
        approvedBy: options?.approvedBy || null,
        approvedAt: options?.approvedBy ? new Date() : null,
        earningIds,
      },
    });

    if (requiresApproval && !options?.approvedBy) {
      return { success: true, payoutId: payout.id };
    }

    if (method === "wallet") {
      await prisma.affiliatePayout.update({
        where: { id: payout.id },
        data: {
          status: "PAID",
          processedAt: new Date(),
        },
      });
    } else if (method === "bank_transfer" && affiliate.paystackRecipientCode) {
      try {
        const reason = `Affiliate commission payout - ${affiliate.referralCode}`;
        const transfer = await Paystack.initiateTransfer({
          amountKobo: amount,
          recipientCode: affiliate.paystackRecipientCode,
          reason,
          reference: `AFF-PAYOUT-${payout.id}`,
        });

        await prisma.affiliatePayout.update({
          where: { id: payout.id },
          data: {
            paystackTransferCode: (transfer as any).transfer_code,
            paystackTransferId: String((transfer as any).id || ""),
            status: "APPROVED",
            bankName: affiliate.bankName,
            accountNumber: affiliate.accountNumber,
          },
        });

        await prisma.affiliate.update({
          where: { id: affiliateId },
          data: {
            pendingEarnings: { decrement: amount },
            paidEarnings: { increment: amount },
          },
        });

        await prisma.affiliateEarning.updateMany({
          where: { id: { in: earningIds } },
          data: {
            status: "paid",
            payoutId: payout.id,
            paidAt: new Date(),
          },
        });

        return {
          success: true,
          payoutId: payout.id,
          transferCode: (transfer as any).transfer_code,
        };
      } catch (error) {
        console.error("[Affiliate] Paystack transfer failed:", error);

        await prisma.affiliatePayout.update({
          where: { id: payout.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            failureReason: error instanceof Error ? error.message : "Transfer initiation failed",
          },
        });

        return {
          success: false,
          payoutId: payout.id,
          error: error instanceof Error ? error.message : "Failed to initiate transfer",
        };
      }
    }

    return { success: true, payoutId: payout.id };
  }

  async getPendingApprovals(storeId: string): Promise<Array<{
    id: string;
    affiliateId: string;
    affiliateName: string;
    affiliateEmail: string;
    amount: number;
    bankName?: string;
    accountNumber?: string;
    initiatedAt: Date;
  }>> {
    const payouts = await prisma.affiliatePayout.findMany({
      where: {
        storeId,
        status: "APPROVAL_REQUIRED",
      },
      include: {
        affiliate: {
          select: {
            name: true,
            email: true,
            bankName: true,
            accountNumber: true,
          },
        },
      },
      orderBy: { initiatedAt: "desc" },
    });

    return payouts.map(p => ({
      id: p.id,
      affiliateId: p.affiliateId,
      affiliateName: p.affiliate.name,
      affiliateEmail: p.affiliate.email,
      amount: Number(p.amount),
      bankName: p.affiliate.bankName || undefined,
      accountNumber: p.affiliate.accountNumber || undefined,
      initiatedAt: p.initiatedAt,
    }));
  }

  async approvePayout(
    payoutId: string,
    approvedBy: string
  ): Promise<{ success: boolean; error?: string; transferCode?: string }> {
    const payout = await prisma.affiliatePayout.findUnique({
      where: { id: payoutId },
      include: {
        affiliate: true,
      },
    });

    if (!payout) {
      return { success: false, error: "Payout not found" };
    }

    if (payout.status !== "APPROVAL_REQUIRED") {
      return { success: false, error: "Payout is not pending approval" };
    }

    if (!payout.affiliate.paystackRecipientCode) {
      return { success: false, error: "Affiliate bank account not configured" };
    }

    await prisma.affiliatePayout.update({
      where: { id: payoutId },
      data: {
        status: "APPROVED",
        approvedBy,
        approvedAt: new Date(),
      },
    });

    try {
      const reason = `Affiliate commission payout - ${payout.affiliate.referralCode}`;
      const transfer = await Paystack.initiateTransfer({
        amountKobo: Number(payout.amount),
        recipientCode: payout.affiliate.paystackRecipientCode,
        reason,
        reference: `AFF-PAYOUT-${payout.id}`,
      });

      await prisma.affiliatePayout.update({
        where: { id: payoutId },
        data: {
          paystackTransferCode: (transfer as any).transfer_code,
          paystackTransferId: String((transfer as any).id || ""),
          status: "PAID",
          processedAt: new Date(),
          bankName: payout.affiliate.bankName,
          accountNumber: payout.affiliate.accountNumber,
        },
      });

      return {
        success: true,
        transferCode: (transfer as any).transfer_code,
      };
    } catch (error) {
      console.error("[Affiliate] Paystack transfer failed after approval:", error);

      await prisma.affiliatePayout.update({
        where: { id: payoutId },
        data: {
          status: "FAILED",
          failedAt: new Date(),
          failureReason: error instanceof Error ? error.message : "Transfer failed",
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Transfer failed",
      };
    }
  }

  async getAffiliateDashboard(affiliateId: string): Promise<{
    affiliate: Affiliate;
    referrals: AffiliateReferral[];
    stats: {
      totalReferrals: number;
      convertedReferrals: number;
      conversionRate: number;
      averageOrder: number;
    };
    payouts: Array<{
      id: string;
      amount: number;
      status: string;
      initiatedAt: Date;
      processedAt?: Date;
    }>;
  }> {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
    });

    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    const [referrals, payouts] = await Promise.all([
      prisma.affiliateReferral.findMany({
        where: { affiliateId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.affiliatePayout.findMany({
        where: { affiliateId },
        orderBy: { initiatedAt: "desc" },
        take: 10,
      }),
    ]);

    const conversionRate = affiliate.totalReferrals > 0
      ? (affiliate.totalConversions / affiliate.totalReferrals) * 100
      : 0;

    const referralsWithAmount = referrals.filter(r => r.orderAmount);
    const avgOrder = referralsWithAmount.length > 0
      ? referralsWithAmount.reduce((sum, r) => sum + Number(r.orderAmount || 0), 0) / referralsWithAmount.length
      : 0;

    return {
      affiliate: this.mapAffiliate(affiliate),
      referrals: referrals.map((r) => ({
        id: r.id,
        affiliateId: r.affiliateId,
        orderId: r.orderId || undefined,
        customerId: r.customerId,
        orderAmount: r.orderAmount ? Number(r.orderAmount) : undefined,
        commission: Number(r.commission),
        status: r.status as AffiliateReferral["status"],
        createdAt: r.createdAt,
        convertedAt: r.convertedAt || undefined,
      })),
      stats: {
        totalReferrals: affiliate.totalReferrals,
        convertedReferrals: affiliate.totalConversions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageOrder: Math.round(avgOrder),
      },
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        initiatedAt: p.initiatedAt,
        processedAt: p.processedAt || undefined,
      })),
    };
  }

  async getStoreAffiliates(
    storeId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ affiliates: Affiliate[]; total: number }> {
    const where: Record<string, unknown> = { storeId };
    if (options?.status) where.status = options.status;

    const [affiliates, total] = await Promise.all([
      prisma.affiliate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.affiliate.count({ where }),
    ]);

    return {
      affiliates: affiliates.map((a) => this.mapAffiliate(a)),
      total,
    };
  }

  async notifyAffiliate(
    affiliateId: string,
    type: string,
    data: Record<string, unknown>
  ): Promise<void> {
    // TODO: Implement email/notification logic
    // For now, just log the notification
    console.log(`[Affiliate Notification] ${type} to ${affiliateId}`, data);
  }

  private generateAffiliateCode(): string {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
  }

  private mapAffiliate(data: Record<string, unknown>): Affiliate {
    return {
      id: String(data.id),
      userId: String(data.userId || ""),
      storeId: String(data.storeId),
      email: String(data.email),
      name: String(data.name),
      phone: data.phone ? String(data.phone) : undefined,
      referralCode: String(data.referralCode || ""),
      status: (data.status as Affiliate["status"]) || "PENDING",
      commissionRate: Number(data.commissionRate),
      totalReferrals: Number(data.totalReferrals),
      totalEarnings: Number(data.totalEarnings),
      pendingEarnings: Number(data.pendingEarnings),
      paidEarnings: Number(data.paidEarnings),
      bankCode: data.bankCode ? String(data.bankCode) : undefined,
      bankName: data.bankName ? String(data.bankName) : undefined,
      accountNumber: data.accountNumber ? String(data.accountNumber) : undefined,
      accountName: data.accountName ? String(data.accountName) : undefined,
      paystackRecipientCode: data.paystackRecipientCode
        ? String(data.paystackRecipientCode)
        : undefined,
      kycStatus: (data.kycStatus as Affiliate["kycStatus"]) || "NOT_STARTED",
      createdAt: data.createdAt as Date,
    };
  }
}

export const affiliateService = new AffiliateService();
