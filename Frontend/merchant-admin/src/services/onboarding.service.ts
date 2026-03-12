import { prisma, OnboardingStatus } from "@/lib/prisma";
import { OnboardingState, OnboardingUpdatePayload, OnboardingData, KycData } from "@/types/onboarding";
import { encrypt } from "@/lib/security/encryption";
import { logger } from "@vayva/shared";
import type { Prisma } from "@vayva/db";

export class OnboardingService {
    static async getState(storeId: string): Promise<OnboardingState> {
        let onboarding = await prisma.merchantOnboarding?.findUnique({
            where: { storeId },
        });
        if (!onboarding) {
            onboarding = await prisma.merchantOnboarding?.create({
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
    
    static async updateState(storeId: string, payload: OnboardingUpdatePayload): Promise<OnboardingState> {
        return await prisma.$transaction(async (tx: any) => {
            const { step, data, isComplete } = payload;
            
            const updateData: {
                updatedAt: Date;
                currentStepKey?: string;
                status?: OnboardingStatus;
                completedAt?: Date;
                data?: Prisma.InputJsonValue;
            } = {
                updatedAt: new Date(),
            };
            
            if (step)
                updateData.currentStepKey = step;
            if ((payload as any).status)
                (updateData as any).status = (payload as any).status as OnboardingStatus;
            if (data) {
                const scrubbed = JSON.parse(JSON.stringify(data)) as OnboardingData;
                if (scrubbed.identity) {
                    // identity only has fullName, phone, email - no PII to scrub
                }
                if (scrubbed.kyc) {
                    delete scrubbed.kyc?.nin;
                    delete scrubbed.kyc?.bvn;
                }
                updateData.data = scrubbed as unknown as Prisma.InputJsonValue;
            }
            if (isComplete) {
                logger.debug("Checking KYC data for onboarding completion", {
                    hasKycNin: !!(data as OnboardingData)?.kyc?.nin,
                });
                
                const hasKyc = (data as OnboardingData)?.kyc?.nin || 
                    (await tx.kycRecord?.findFirst({ where: { storeId } }));
                
                logger.debug("KYC validation result", { hasKyc: !!hasKyc });
                
                if (!hasKyc) {
                    throw new Error("Cannot complete onboarding: KYC verification is required");
                }
                (updateData as any).status = "COMPLETE";
                updateData.completedAt = new Date();
            }
            
            const updatedOnboarding = await tx.merchantOnboarding?.upsert({
                where: { storeId },
                update: updateData,
                create: {
                    storeId,
                    status: "IN_PROGRESS",
                    currentStepKey: step || "welcome",
                    completedSteps: [],
                    data: data || {},
                    ...updateData
                }
            });
            
            const storeUpdate: {
                onboardingLastStep?: string;
                onboardingCompleted?: boolean;
                isLive?: boolean;
                category?: string;
                industrySlug?: string;
                name?: string;
            } = {};
            
            if (step)
                storeUpdate.onboardingLastStep = step;
            if (isComplete) {
                storeUpdate.onboardingCompleted = true;
            }
            if ((data as OnboardingData)?.intent?.segment)
                storeUpdate.category = (data as OnboardingData).intent!.segment;
            if ((data as OnboardingData)?.industrySlug)
                storeUpdate.industrySlug = (data as OnboardingData).industrySlug;
            if (typeof (data as OnboardingData)?.business?.storeName === "string" && 
                (data as OnboardingData).business!.storeName!.trim()) {
                storeUpdate.name = (data as OnboardingData).business!.storeName!.trim();
            }
            
            if (Object.keys(storeUpdate).length > 0) {
                await tx.store?.update({
                    where: { id: storeId },
                    data: storeUpdate
                });
            }
            
            const kycData = (data as OnboardingData)?.kyc;
            if (kycData) {
                const kycUpdate: {
                    ninLast4?: string;
                    fullNinEncrypted?: string;
                    bvnLast4?: string;
                    fullBvnEncrypted?: string;
                } = {};
                if ((kycData as KycData).nin) {
                    kycUpdate.ninLast4 = (kycData as KycData).nin?.slice(-4);
                    kycUpdate.fullNinEncrypted = encrypt((kycData as KycData).nin!);
                }
                if ((kycData as KycData).bvn) {
                    kycUpdate.bvnLast4 = (kycData as KycData).bvn?.slice(-4);
                    kycUpdate.fullBvnEncrypted = encrypt((kycData as KycData).bvn!);
                }
                if (Object.keys(kycUpdate).length > 0) {
                    await tx.kycRecord?.upsert({
                        where: { storeId },
                        update: kycUpdate,
                        create: {
                            storeId,
                            status: "pending",
                            ninLast4: kycUpdate.ninLast4 || "",
                            bvnLast4: kycUpdate.bvnLast4 || "0000",
                            ...kycUpdate
                        }
                    });
                }
            }
            
            if ((data as OnboardingData)?.finance?.accountNumber && 
                (data as OnboardingData)?.finance?.bankName) {
                const bank = (data as OnboardingData).finance!;
                const existing = await tx.bankBeneficiary?.findFirst({
                    where: { storeId, isDefault: true }
                });
                if (existing) {
                    await tx.bankBeneficiary?.update({
                        where: { id: existing.id },
                        data: {
                            bankName: bank.bankName,
                            accountNumber: bank.accountNumber,
                            accountName: bank.accountName || "",
                            bankCode: bank.bankCode || "000"
                        }
                    });
                }
                else {
                    await tx.bankBeneficiary?.create({
                        data: {
                            storeId,
                            isDefault: true,
                            bankName: bank.bankName,
                            accountNumber: bank.accountNumber,
                            accountName: bank.accountName || "",
                            bankCode: bank.bankCode || "000"
                        }
                    });
                }
            }
            return updatedOnboarding as OnboardingState;
        });
    }
}
