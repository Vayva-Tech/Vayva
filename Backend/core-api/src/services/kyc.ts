import { KycStatus, prisma } from "@vayva/db";
import { encrypt } from "@/lib/security/encryption";

export type IdType = "NIN" | "DRIVERS_LICENSE" | "VOTERS_CARD" | "PASSPORT" | "CAC";

export interface KycSubmissionData {
  idType: IdType;
  idNumber: string;
  idImageUrl?: string;
  cacNumber?: string;
  cacDocumentUrl?: string;
  proofOfAddressUrl?: string;
  consent: boolean;
  ipAddress: string;
  actorUserId: string;
}

export interface KycLevel {
  level: 0 | 1 | 2 | 3;
  name: string;
  dailyLimit: number;
  features: string[];
}

export const KYC_LEVELS: KycLevel[] = [
  {
    level: 0,
    name: "Basic",
    dailyLimit: 50000,
    features: ["Create store", "Basic dashboard"],
  },
  {
    level: 1,
    name: "Verified",
    dailyLimit: 200000,
    features: ["Accept payments", "Withdraw funds", "Basic support"],
  },
  {
    level: 2,
    name: "Trusted",
    dailyLimit: 1000000,
    features: ["Higher limits", "Priority support", "Advanced analytics"],
  },
  {
    level: 3,
    name: "Business Verified",
    dailyLimit: 5000000,
    features: ["Unlimited transactions", "Dedicated account manager", "API access"],
  },
];

export class KycService {
  /**
   * Submit KYC for manual review with flexible ID options
   */
  async submitForReview(storeId: string, data: KycSubmissionData) {
    const idLast4 = data.idNumber.slice(-4);
    
    // Calculate KYC level based on documents provided
    let targetLevel: 0 | 1 | 2 | 3 = 1;
    if (data.idType === "CAC" || data.cacNumber) {
      targetLevel = 3;
    } else if (data.proofOfAddressUrl) {
      targetLevel = 2;
    }

    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: "MANUAL_SUBMISSION",
      method: data.idType,
      idLast4,
      hasCac: !!data.cacNumber,
      hasProofOfAddress: !!data.proofOfAddressUrl,
      targetLevel,
      result: "PENDING",
      ipAddress: data.ipAddress,
      actorUserId: data.actorUserId,
    };

    const record = await prisma.kycRecord.upsert({
      where: { storeId },
      create: {
        storeId,
        ninLast4: data.idType === "NIN" ? idLast4 : "",
        bvnLast4: "",
        status: KycStatus.PENDING,
        fullNinEncrypted: encrypt(data.idNumber),
        audit: [auditEntry],
        // Store CAC info if provided
        cacNumberEncrypted: data.cacNumber ? encrypt(data.cacNumber) : null,
      },
      update: {
        ninLast4: data.idType === "NIN" ? idLast4 : "",
        status: KycStatus.PENDING,
        fullNinEncrypted: encrypt(data.idNumber),
        audit: { push: auditEntry },
        cacNumberEncrypted: data.cacNumber ? encrypt(data.cacNumber) : undefined,
      },
    });

    // Update store kycStatus cache
    await prisma.store.update({
      where: { id: storeId },
      data: { kycStatus: KycStatus.PENDING },
    });

    return {
      success: true,
      status: "PENDING",
      recordId: record.id,
      targetLevel,
      message: "Your documents have been submitted for review. You can start using the platform with basic limits while we verify your information.",
    };
  }

  /**
   * Skip KYC for now - allows onboarding with Level 0 limits
   */
  async skipForNow(storeId: string, actorUserId: string, ipAddress: string) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: "SKIPPED",
      result: "NOT_STARTED",
      ipAddress,
      actorUserId,
    };

    const record = await prisma.kycRecord.upsert({
      where: { storeId },
      create: {
        storeId,
        ninLast4: "",
        bvnLast4: "",
        status: KycStatus.NOT_STARTED,
        audit: [auditEntry],
      },
      update: {
        status: KycStatus.NOT_STARTED,
        audit: { push: auditEntry },
      },
    });

    await prisma.store.update({
      where: { id: storeId },
      data: { kycStatus: KycStatus.NOT_STARTED },
    });

    return {
      success: true,
      status: "NOT_STARTED",
      recordId: record.id,
      targetLevel: 0,
      message: "You can complete verification later from your settings to unlock higher limits.",
    };
  }

  /**
   * Get current KYC level and limits for a store
   */
  async getKycLevel(storeId: string): Promise<KycLevel> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { kycStatus: true },
    });

    if (!store || store.kycStatus !== "VERIFIED") {
      // Return level 0 or 1 based on verification status
      if (store?.kycStatus === "PENDING") {
        return KYC_LEVELS[1]; // Level 1 while pending review
      }
      return KYC_LEVELS[0]; // Level 0 for skipped/unverified
    }

    // For verified users, get level from KYC record audit trail
    const record = await prisma.kycRecord.findUnique({
      where: { storeId },
      select: { audit: true },
    });

    if (record?.audit && Array.isArray(record.audit)) {
      const submissionEntry = record.audit.find((entry: unknown) => {
        const e = entry as { action?: string; targetLevel?: number };
        return e.action === "MANUAL_SUBMISSION";
      });
      const targetLevel = (submissionEntry as { targetLevel?: number })?.targetLevel;
      if (targetLevel !== undefined && targetLevel >= 0 && targetLevel <= 3) {
        return KYC_LEVELS[targetLevel] || KYC_LEVELS[1];
      }
    }

    return KYC_LEVELS[1];
  }

  /**
   * Check if transaction is within daily limit
   */
  async checkDailyLimit(storeId: string, amount: number): Promise<{ allowed: boolean; limit: number; current: number }> {
    const level = await this.getKycLevel(storeId);
    const limit = level.dailyLimit;

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTotal = await prisma.paymentTransaction.aggregate({
      where: {
        storeId,
        createdAt: { gte: today },
        status: "SUCCESS",
      },
      _sum: {
        amount: true,
      },
    });

    const current = Number(dailyTotal._sum.amount || 0);
    const allowed = (current + amount) <= limit;

    return { allowed, limit, current };
  }
}

export const kycService = new KycService();
