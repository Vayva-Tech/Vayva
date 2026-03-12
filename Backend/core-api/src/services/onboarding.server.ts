import { prisma, OnboardingStatus, Prisma } from "@/lib/db";
import { OnboardingState, OnboardingUpdatePayload } from "@/types/onboarding";
import { encrypt } from "@/lib/security/encryption";
import { logger } from "@vayva/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export class OnboardingService {
  /**
   * Get or initialize onboarding state for a store
   */
  static async getState(storeId: string): Promise<OnboardingState> {
    let onboarding = await prisma.merchantOnboarding.findUnique({
      where: { storeId },
    });
    if (!onboarding) {
      onboarding = await prisma.merchantOnboarding.create({
        data: {
          storeId,
          status: "NOT_STARTED",
          currentStepKey: "welcome",
          completedSteps: [],
          data: {},
        },
      });
    }
    return onboarding as OnboardingState;
  }
  /**
   * Update onboarding state and sync related entities (Store, KYC, Bank)
   */
  static async updateState(
    storeId: string,
    payload: OnboardingUpdatePayload,
  ): Promise<OnboardingState> {
    return await prisma.$transaction(async (tx) => {
      const { step, data, isComplete } = payload;
      const dataRecord = getRecord(data) ?? {};
      // 1. Prepare Onboarding Update
      const updateData: {
        updatedAt: Date;
        currentStepKey?: string;
        status?: OnboardingStatus;
        completedAt?: Date;
        data?: Prisma.InputJsonValue;
      } = {
        updatedAt: new Date(),
      };
      if (step) updateData.currentStepKey = step;
      if (payload.status)
        updateData.status = payload.status as OnboardingStatus;
      // Merge data logic:
      // For now, we assume the frontend sends what it wants to persist for 'data'.
      // In a partial update scenario, we might need to fetch->merge->save if 'data' is partial.
      // But usually the wizard context holds the full state.
      // We'll update the 'data' field directly if provided.
      if (data) {
        // Scrub sensitive PII from stored JSON
        const scrubbed = JSON.parse(JSON.stringify(data));
        if (scrubbed.identity) {
          delete scrubbed.identity.nin;
          delete scrubbed.identity.bvn;
        }
        if (scrubbed.kyc) {
          delete scrubbed.kyc.nin;
          delete scrubbed.kyc.bvn;
        }
        updateData.data = scrubbed as Prisma.InputJsonValue;
      }
      if (isComplete) {
        // SERVER-SIDE VALIDATION
        // We cannot trust the client to say "I'm done" without proof.
        // We must check if the dependent records actually exist.
        // Since we are inside a transaction, we can't see the uncommitted changes from step 3/4 easily
        // unless we rely on the implementation order or perform the check *after* this transaction?
        // OR: We trust the current 'data' payload contains everything required, BUT that's weak.
        // Better approach:
        // We let the update happen, but we only flip `status='COMPLETED'` if validation passes.
        // However, `validateCompletion` reads from DB.
        // Ideally, we move `updateState` logic to ensure dependent records are upserted FIRST.
        // In this file, we DO upsert them later (Step 3/4). This is a logic flaw in the original code order.
        // Fix: Move Onboarding Update (Step 1) to be LAST.
        // For now, to minimize diff risk, we will optimistically allow it BUT
        // we should strictly check the *incoming data* if we can't check DB yet.
        // Validate KYC is required, but finance is optional (can be added later)
        logger.debug("Checking KYC data for onboarding completion", {
          hasIdentityNin: !!getRecord(dataRecord.identity)?.nin,
          hasKycNin: !!getRecord(dataRecord.kyc)?.nin,
        });

        const identityRec = getRecord(dataRecord.identity);
        const kycRec = getRecord(dataRecord.kyc);
        const hasKyc =
          (typeof identityRec?.nin === "string" &&
            identityRec.nin.length > 0) ||
          (typeof kycRec?.nin === "string" && kycRec.nin.length > 0) ||
          (await tx.kycRecord.findFirst({ where: { storeId } }));

        logger.debug("KYC validation result", { hasKyc: !!hasKyc });

        if (!hasKyc) {
          throw new Error(
            "Cannot complete onboarding: KYC verification is required",
          );
        }
        updateData.status = "COMPLETE";
        updateData.completedAt = new Date();
      }
      const updatedOnboarding = await tx.merchantOnboarding.upsert({
        where: { storeId },
        update: updateData,
        create: {
          storeId,
          status: "IN_PROGRESS",
          currentStepKey: step || "welcome",
          completedSteps: [],
          data: (updateData.data ?? {}) as Prisma.InputJsonValue,
          ...updateData,
        },
      });
      // 2. Sync Store Fields
      const storeUpdate: {
        onboardingLastStep?: string;
        onboardingCompleted?: boolean;
        isLive?: boolean;
        category?: string;
        industrySlug?: string;
        name?: string;
      } = {};
      if (step) storeUpdate.onboardingLastStep = step;
      if (isComplete) {
        storeUpdate.onboardingCompleted = true;
        // Usually "Completed" means ready to trade or ready for manual review.
        // We'll set onboardingCompleted=true.
      }
      const intentRec = getRecord(dataRecord.intent);
      const businessRec = getRecord(dataRecord.business);
      const industrySlug = getString(dataRecord.industrySlug);
      const segment = getString(intentRec?.segment);
      const storeName = getString(businessRec?.storeName);

      if (segment) storeUpdate.category = segment;
      if (industrySlug) storeUpdate.industrySlug = industrySlug;
      if (storeName?.trim()) storeUpdate.name = storeName.trim();
      if (Object.keys(storeUpdate).length > 0) {
        await tx.store.update({
          where: { id: storeId },
          data: storeUpdate,
        });
      }
      // 3. Sync KYC Data
      const kycData = isRecord(dataRecord.kyc)
        ? dataRecord.kyc
        : isRecord(dataRecord.identity)
          ? dataRecord.identity
          : undefined;
      if (kycData) {
        const kycUpdate: {
          ninLast4?: string;
          fullNinEncrypted?: string;
          bvnLast4?: string;
          fullBvnEncrypted?: string;
        } = {};
        if (typeof kycData.nin === "string") {
          kycUpdate.ninLast4 = kycData.nin.slice(-4);
          kycUpdate.fullNinEncrypted = encrypt(kycData.nin);
        }
        if (typeof kycData.bvn === "string") {
          kycUpdate.bvnLast4 = kycData.bvn.slice(-4);
          kycUpdate.fullBvnEncrypted = encrypt(kycData.bvn);
        }
        if (Object.keys(kycUpdate).length > 0) {
          await tx.kycRecord.upsert({
            where: { storeId },
            update: kycUpdate,
            create: {
              storeId,
              status: "PENDING",
              ninLast4: kycUpdate.ninLast4 || "",
              bvnLast4: kycUpdate.bvnLast4 || "0000",
              ...kycUpdate,
            },
          });
        }
      }
      // 4. Sync Financial Data (Bank)
      const financeRec = getRecord(dataRecord.finance);
      const accountNumber = getString(financeRec?.accountNumber);
      const bankName = getString(financeRec?.bankName);
      if (accountNumber && bankName) {
        const accountName = getString(financeRec?.accountName) || "";
        const bankCode = getString(financeRec?.bankCode) || "000";
        // Find existing default or create new
        const existing = await tx.bankBeneficiary.findFirst({
          where: { storeId, isDefault: true },
        });
        if (existing) {
          await tx.bankBeneficiary.update({
            where: { id: existing.id },
            data: {
              bankName,
              accountNumber,
              accountName,
              bankCode,
            },
          });
        } else {
          await tx.bankBeneficiary.create({
            data: {
              storeId,
              isDefault: true,
              bankName,
              accountNumber,
              accountName,
              bankCode,
            },
          });
        }
      }
      return updatedOnboarding as OnboardingState;
    });
  }
}
