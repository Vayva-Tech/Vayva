import { prisma, Prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

const RESERVED_STORE_SLUGS = new Set([
    "admin",
    "merchant",
    "ops",
    "www",
    "api",
    "support",
    "app",
    "dashboard",
    "help",
    "docs",
    "blog",
    "status",
]);

interface OnboardingState {
    schemaVersion?: number;
    industrySlug?: string;
    kycStatus?: string;
    business?: {
        slug?: string;
        name?: string;
        storeName?: string;
        category?: string;
        state?: string;
        city?: string;
        legalName?: string;
        email?: string;
        registeredAddress?: {
            addressLine1?: string;
            addressLine2?: string;
            city?: string;
            state?: string;
            landmark?: string;
        };
    };
    storeDetails?: {
        slug?: string;
        domainPreference?: string;
        publishStatus?: string;
    };
    finance?: {
        currency?: string;
        payoutScheduleAcknowledged?: boolean;
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
        bankCode?: string;
    };
    whatsapp?: { number?: string };
    identity?: { phone?: string };
    logistics?: {
        deliveryMode?: string;
        pickupAddress?: string;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncOnboardingData(storeId: string, state: OnboardingState) {
    if (!storeId || !state)
        return;
    // Schema Version Guardrail
    const EXPECTED_SCHEMA_VERSION = 1;
    if (state.schemaVersion && state.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
        logger.warn(`[Sync][Drift Alarm] Schema version mismatch! Expected ${EXPECTED_SCHEMA_VERSION}, got ${state.schemaVersion}. Sync logic may be outdated.`, { app: "merchant" });
    }
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const rawSlug = state.business?.slug || state.storeDetails?.slug;
            const normalizedSlug = typeof rawSlug === "string" ? rawSlug.trim().toLowerCase() : "";
            if (normalizedSlug && RESERVED_STORE_SLUGS.has(normalizedSlug)) {
                throw new Error("Store slug is reserved");
            }

            // 1. Update Core Store Details
            await tx.store.update({
                where: { id: storeId },
                data: {
                    name: state.business?.name || undefined,
                    slug: normalizedSlug || undefined,
                    // Map category for analytics bucket if present
                    category: state.business?.category || undefined,
                    // CRITICAL: Persist Industry Variant Slug
                    industrySlug: state.industrySlug || undefined,
                    // Store settings for domain preference and currency
                    settings: {
                        domainPreference: state.storeDetails?.domainPreference || "subdomain",
                        currency: state.finance?.currency || "NGN",
                        payoutScheduleAcknowledged: state.finance?.payoutScheduleAcknowledged,
                    },
                    isLive: state.storeDetails?.publishStatus === "published",
                },
            });
            // 2. Sync Store Profile (Location & Contact)
            // Check if profile exists
            const existingProfile = await tx.storeProfile.findUnique({
                where: { storeId },
            });
            const profileData = {
                state: state.business?.state,
                city: state.business?.city,
                displayName: state.business?.storeName || state.business?.name,
                whatsappNumberE164: state.whatsapp?.number || state.identity?.phone, // Assuming owner phone is contact
            };
            if (existingProfile) {
                await tx.storeProfile.update({
                    where: { storeId },
                    data: profileData,
                });
            }
            else {
                await tx.storeProfile.create({
                    data: {
                        storeId,
                        slug: state.business?.slug || state.storeDetails?.slug || `store-${storeId.substring(0, 8)}`,
                        displayName: profileData.displayName || "My Store",
                        state: profileData.state,
                        city: profileData.city,
                        whatsappNumberE164: profileData.whatsappNumberE164,
                    },
                });
            }
            // [NEW] 2.1 Sync WhatsApp Channel
            if (profileData.whatsappNumberE164) {
                const existingChannel = await tx.whatsappChannel.findUnique({
                    where: { storeId },
                    select: { status: true },
                });
                await tx.whatsappChannel.upsert({
                    where: { storeId },
                    create: {
                        storeId,
                        displayPhoneNumber: profileData.whatsappNumberE164,
                        status: "PENDING",
                    },
                    update: {
                        displayPhoneNumber: profileData.whatsappNumberE164,
                        status: existingChannel?.status === "CONNECTED" ? "CONNECTED" : "PENDING",
                    },
                });
            }
            // 3. Sync Billing Profile (Legal Name)
            const registered = state.business?.registeredAddress;
            const addressParts = [
                registered?.addressLine1,
                registered?.addressLine2,
                registered?.city,
                registered?.state,
            ].filter(Boolean);
            const addressText = addressParts.length > 0
                ? registered?.landmark
                    ? `${addressParts.join(", ")} (${registered.landmark})`
                    : addressParts.join(", ")
                : undefined;

            if (state.business?.legalName || addressText) {
                await tx.billingProfile.upsert({
                    where: { storeId },
                    create: {
                        storeId,
                        legalName: state.business?.legalName,
                        addressText,
                        billingEmail: state.business?.email,
                    },
                    update: {
                        legalName: state.business?.legalName,
                        addressText,
                        billingEmail: state.business?.email,
                    },
                });
            }
            // 4. Sync Bank Account
            if (state.finance?.bankName && state.finance?.accountNumber) {
                // Deactivate old default
                await tx.bankBeneficiary.updateMany({
                    where: { storeId, isDefault: true },
                    data: { isDefault: false },
                });
                const bankInfo = state.finance;
                await tx.bankBeneficiary.create({
                    data: {
                        storeId,
                        bankName: bankInfo.bankName ?? "",
                        accountNumber: bankInfo.accountNumber ?? "",
                        accountName: bankInfo.accountName ?? "",
                        bankCode: bankInfo.bankCode || "000",
                        isDefault: true,
                    },
                });
            }
            // 5. Sync Delivery Settings
            const deliveryMethods = [];
            if (state.logistics?.deliveryMode !== "pickup") {
                deliveryMethods.push("manual"); // Default to manual if delivery is enabled
            }
            await tx.storeProfile.update({
                where: { storeId },
                data: {
                    pickupAvailable: state.logistics?.deliveryMode !== "delivery",
                    pickupAddress: state.logistics?.pickupAddress || undefined,
                    deliveryMethods: deliveryMethods.length > 0 ? deliveryMethods : undefined,
                },
            });
            // [NEW] 5.1 Sync Delivery Policy as Merchant Policy
            if (state.logistics?.deliveryMode) {
                const policyContent = state.logistics.deliveryMode === "pickup"
                    ? "Orders are only available for pickup at our physical location."
                    : state.logistics.deliveryMode; // e.g. "Shipped within 24 hours"
                // We use upsert for the policy
                const store = await tx.store.findUnique({
                    where: { id: storeId },
                    select: { slug: true },
                });
                await tx.merchantPolicy.upsert({
                    where: { storeId_type: { storeId, type: "SHIPPING_DELIVERY" } },
                    create: {
                        storeId,
                        merchantId: storeId, // Using storeId as merchantId for simple tenant mapping
                        storeSlug: store?.slug || "unknown",
                        type: "SHIPPING_DELIVERY",
                        title: "Delivery Policy",
                        contentMd: policyContent,
                        contentHtml: `<p>${policyContent}</p>`,
                        status: "PUBLISHED",
                    },
                    update: {
                        contentMd: policyContent,
                        contentHtml: `<p>${policyContent}</p>`,
                        status: "PUBLISHED",
                    },
                });
            }
            // 6. Sync KYC Status
            if (state.kycStatus === "verified" || state.kycStatus === "pending") {
                await tx.kycRecord.upsert({
                    where: { storeId },
                    create: {
                        storeId,
                        status: "PENDING" as any,
                        ninLast4: "0000",
                        bvnLast4: "0000",
                    },
                    update: {
                        status: "PENDING" as any,
                    },
                });
            }
        });
    }
    catch (error) {
        logger.error("[Sync] Failed to sync onboarding data:", { error: error instanceof Error ? error.message : String(error) });
        // We log but maybe allow completion logic to proceed or fail?
        // Throwing allows caller to handle it.
        throw error;
    }
}
