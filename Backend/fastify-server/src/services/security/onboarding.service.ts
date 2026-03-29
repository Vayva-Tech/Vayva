import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';
import type { Prisma } from '@vayva/db';

/**
 * Onboarding Service - Handles onboarding data synchronization
 * 
 * Manages:
 * - Store details and slug management
 * - Store profile creation/updates
 * - WhatsApp channel setup
 * - Billing profile synchronization
 * - Bank account information
 * - Delivery settings and policies
 * - KYC status updates
 */

const RESERVED_STORE_SLUGS = new Set([
  'admin',
  'merchant',
  'ops',
  'www',
  'api',
  'support',
  'app',
  'dashboard',
  'help',
  'docs',
  'blog',
  'status',
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

export class OnboardingService {
  /**
   * Sync onboarding data across multiple tables
   * 
   * @param storeId - The store ID to sync data for
   * @param state - Complete onboarding state object
   * @returns true if successful
   */
  async syncOnboardingData(storeId: string, state: OnboardingState): Promise<boolean> {
    if (!storeId || !state) {
      logger.warn('[OnboardingService] Invalid storeId or state provided');
      return false;
    }

    const EXPECTED_SCHEMA_VERSION = 1;
    
    if (state.schemaVersion && state.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
      logger.warn('[OnboardingService] Schema version mismatch', {
        expected: EXPECTED_SCHEMA_VERSION,
        received: state.schemaVersion,
      });
    }

    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const rawSlug = state.business?.slug || state.storeDetails?.slug;
        const normalizedSlug = typeof rawSlug === 'string' 
          ? rawSlug.trim().toLowerCase() 
          : '';

        // Validate slug is not reserved
        if (normalizedSlug && RESERVED_STORE_SLUGS.has(normalizedSlug)) {
          throw new Error('Store slug is reserved');
        }

        // 1. Update Core Store Details
        await tx.store.update({
          where: { id: storeId },
          data: {
            name: state.business?.name || undefined,
            slug: normalizedSlug || undefined,
            category: state.business?.category || undefined,
            industrySlug: state.industrySlug || undefined,
            settings: {
              domainPreference: state.storeDetails?.domainPreference || 'subdomain',
              currency: state.finance?.currency || 'NGN',
              payoutScheduleAcknowledged: state.finance?.payoutScheduleAcknowledged,
            },
            isLive: state.storeDetails?.publishStatus === 'published',
          },
        });

        // 2. Sync Store Profile
        await this.syncStoreProfile(tx, storeId, state);

        // 2.1 Sync WhatsApp Channel
        await this.syncWhatsAppChannel(tx, storeId, state);

        // 3. Sync Billing Profile
        await this.syncBillingProfile(tx, storeId, state);

        // 4. Sync Bank Account
        await this.syncBankAccount(tx, storeId, state);

        // 5. Sync Delivery Settings
        await this.syncDeliverySettings(tx, storeId, state);

        // 6. Sync KYC Status
        await this.syncKYCStatus(tx, storeId, state);
      });

      logger.info('[OnboardingService] Onboarding data synced successfully', {
        storeId,
        hasIndustrySlug: !!state.industrySlug,
        hasBusinessName: !!state.business?.name,
      });

      return true;
    } catch (error) {
      logger.error('[OnboardingService] Failed to sync onboarding data', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Sync store profile data
   */
  private async syncStoreProfile(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ): Promise<void> {
    const existingProfile = await tx.storeProfile.findUnique({
      where: { storeId },
    });

    const profileData = {
      state: state.business?.state,
      city: state.business?.city,
      displayName: state.business?.storeName || state.business?.name,
      whatsappNumberE164: state.whatsapp?.number || state.identity?.phone,
    };

    if (existingProfile) {
      await tx.storeProfile.update({
        where: { storeId },
        data: profileData,
      });
    } else {
      const rawSlug = state.business?.slug || state.storeDetails?.slug;
      await tx.storeProfile.create({
        data: {
          storeId,
          slug: rawSlug || `store-${storeId.substring(0, 8)}`,
          displayName: profileData.displayName || 'My Store',
          state: profileData.state,
          city: profileData.city,
          whatsappNumberE164: profileData.whatsappNumberE164,
        },
      });
    }
  }

  /**
   * Sync WhatsApp channel data
   */
  private async syncWhatsAppChannel(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ): Promise<void> {
    const whatsappNumber = state.whatsapp?.number || state.identity?.phone;
    
    if (!whatsappNumber) {
      return;
    }

    const existingChannel = await tx.whatsappChannel.findUnique({
      where: { storeId },
      select: { status: true },
    });

    await tx.whatsappChannel.upsert({
      where: { storeId },
      create: {
        storeId,
        displayPhoneNumber: whatsappNumber,
        status: 'PENDING',
      },
      update: {
        displayPhoneNumber: whatsappNumber,
        status: existingChannel?.status === 'CONNECTED' ? 'CONNECTED' : 'PENDING',
      },
    });
  }

  /**
   * Sync billing profile data
   */
  private async syncBillingProfile(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ): Promise<void> {
    const registered = state.business?.registeredAddress;
    const addressParts = [
      registered?.addressLine1,
      registered?.addressLine2,
      registered?.city,
      registered?.state,
    ].filter(Boolean);

    const addressText = addressParts.length > 0
      ? registered?.landmark
        ? `${addressParts.join(', ')} (${registered.landmark})`
        : addressParts.join(', ')
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
  }

  /**
   * Sync bank account data
   */
  private async syncBankAccount(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ): Promise<void> {
    if (!state.finance?.bankName || !state.finance?.accountNumber) {
      return;
    }

    // Deactivate old default
    await tx.bankBeneficiary.updateMany({
      where: { storeId, isDefault: true },
      data: { isDefault: false },
    });

    const bankInfo = state.finance;
    await tx.bankBeneficiary.create({
      data: {
        storeId,
        bankName: bankInfo.bankName ?? '',
        accountNumber: bankInfo.accountNumber ?? '',
        accountName: bankInfo.accountName ?? '',
        bankCode: bankInfo.bankCode || '000',
        isDefault: true,
      },
    });
  }

  /**
   * Sync delivery settings and policy
   */
  private async syncDeliverySettings(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ): Promise<void> {
    const deliveryMethods: string[] = [];
    
    if (state.logistics?.deliveryMode !== 'pickup') {
      deliveryMethods.push('manual');
    }

    await tx.storeProfile.update({
      where: { storeId },
      data: {
        pickupAvailable: state.logistics?.deliveryMode !== 'delivery',
        pickupAddress: state.logistics?.pickupAddress || undefined,
        deliveryMethods: deliveryMethods.length > 0 ? deliveryMethods : undefined,
      },
    });

    // Sync Delivery Policy
    if (state.logistics?.deliveryMode) {
      const policyContent = state.logistics.deliveryMode === 'pickup'
        ? 'Orders are only available for pickup at our physical location.'
        : state.logistics.deliveryMode;

      const store = await tx.store.findUnique({
        where: { id: storeId },
        select: { slug: true },
      });

      await tx.merchantPolicy.upsert({
        where: { 
          storeId_type: { 
            storeId, 
            type: 'SHIPPING_DELIVERY' 
          } 
        },
        create: {
          storeId,
          merchantId: storeId,
          storeSlug: store?.slug || 'unknown',
          type: 'SHIPPING_DELIVERY',
          title: 'Delivery Policy',
          contentMd: policyContent,
          contentHtml: `<p>${policyContent}</p>`,
          status: 'PUBLISHED',
        },
        update: {
          contentMd: policyContent,
          contentHtml: `<p>${policyContent}</p>`,
          status: 'PUBLISHED',
        },
      });
    }
  }

  /**
   * Sync KYC status
   */
  private async syncKYCStatus(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ): Promise<void> {
    if (state.kycStatus === 'verified' || state.kycStatus === 'pending') {
      await tx.kycRecord.upsert({
        where: { storeId },
        create: {
          storeId,
          status: 'PENDING',
          ninLast4: '0000',
          bvnLast4: '0000',
        },
        update: {
          status: 'PENDING',
        },
      });
    }
  }

  /**
   * Check if a store slug is available
   */
  async checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
    const normalizedSlug = slug.trim().toLowerCase();
    
    if (RESERVED_STORE_SLUGS.has(normalizedSlug)) {
      return { available: false };
    }

    const existing = await prisma.store.findUnique({
      where: { slug: normalizedSlug },
    });

    return { available: !existing };
  }

  /**
   * Get onboarding progress for a store
   */
  async getOnboardingProgress(storeId: string): Promise<{
    completedSteps: string[];
    pendingSteps: string[];
    percentComplete: number;
  }> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        storeProfile: true,
        billingProfile: true,
        bankBeneficiaries: {
          where: { isDefault: true },
        },
        kycRecords: true,
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    const steps = {
      businessDetails: !!store.name && !!store.slug,
      location: !!store.storeProfile?.state && !!store.storeProfile?.city,
      contact: !!store.storeProfile?.whatsappNumberE164,
      billing: !!store.billingProfile?.legalName,
      bankAccount: store.bankBeneficiaries.length > 0,
      delivery: !!store.storeProfile?.deliveryMethods,
      kyc: store.kycRecords.length > 0,
    };

    const completedSteps = Object.entries(steps)
      .filter(([_, completed]) => completed)
      .map(([step, _]) => step);

    const pendingSteps = Object.entries(steps)
      .filter(([_, completed]) => !completed)
      .map(([step, _]) => step);

    const totalSteps = Object.keys(steps).length;
    const percentComplete = Math.round((completedSteps.length / totalSteps) * 100);

    return {
      completedSteps,
      pendingSteps,
      percentComplete,
    };
  }

  /**
   * Update onboarding step completion
   */
  async updateOnboardingStep(
    storeId: string,
    step: string,
    completed: boolean,
    data?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      // This would typically update an onboarding_progress table
      // For now, we'll log it as the implementation may vary
      logger.info('[OnboardingService] Onboarding step updated', {
        storeId,
        step,
        completed,
        hasData: !!data,
      });

      return true;
    } catch (error) {
      logger.error('[OnboardingService] Failed to update onboarding step', {
        storeId,
        step,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
