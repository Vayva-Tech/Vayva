import { prisma, type Prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

const RESERVED_STORE_SLUGS = new Set([
  'admin', 'merchant', 'ops', 'www', 'api',
  'support', 'app', 'dashboard', 'help', 'docs',
  'blog', 'status',
]);

export class OnboardingSyncService {
  constructor(private readonly db = prisma) {}

  async syncOnboardingData(storeId: string, state: OnboardingState) {
    if (!storeId || !state) return;

    const EXPECTED_SCHEMA_VERSION = 1;
    if (state.schemaVersion && state.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
      logger.warn(`[Sync][Drift Alarm] Schema version mismatch! Expected ${EXPECTED_SCHEMA_VERSION}, got ${state.schemaVersion}`);
    }

    try {
      await this.db.$transaction(async (tx) => {
        const rawSlug = state.business?.slug || state.storeDetails?.slug;
        const normalizedSlug = typeof rawSlug === 'string' ? rawSlug.trim().toLowerCase() : '';
        
        if (normalizedSlug && RESERVED_STORE_SLUGS.has(normalizedSlug)) {
          throw new Error('Store slug is reserved');
        }

        // Update core store details
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

        // Sync Store Profile
        await this.syncStoreProfile(tx, storeId, state);

        // Sync WhatsApp Channel
        await this.syncWhatsAppChannel(tx, storeId, state);

        // Sync Billing Profile
        await this.syncBillingProfile(tx, storeId, state);

        // Sync Bank Account
        await this.syncBankAccount(tx, storeId, state);

        // Sync Delivery Settings
        await this.syncDeliverySettings(tx, storeId, state);

        // Sync KYC Status
        await this.syncKycStatus(tx, storeId, state);
      });

      logger.info('[OnboardingSync] Data synced successfully', { storeId });
    } catch (error) {
      logger.error('[OnboardingSync] Failed to sync data:', error);
      throw error;
    }
  }

  private async syncStoreProfile(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ) {
    const existingProfile = await tx.storeProfile.findUnique({ where: { storeId } });
    
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
      await tx.storeProfile.create({
        data: {
          storeId,
          slug: state.business?.slug || state.storeDetails?.slug || `store-${storeId.substring(0, 8)}`,
          displayName: profileData.displayName || 'My Store',
          state: profileData.state,
          city: profileData.city,
          whatsappNumberE164: profileData.whatsappNumberE164,
        },
      });
    }
  }

  private async syncWhatsAppChannel(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ) {
    const whatsappNumber = state.whatsapp?.number || state.identity?.phone;
    
    if (whatsappNumber) {
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
  }

  private async syncBillingProfile(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ) {
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

  private async syncBankAccount(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ) {
    if (state.finance?.bankName && state.finance?.accountNumber) {
      await tx.bankBeneficiary.updateMany({
        where: { storeId, isDefault: true },
        data: { isDefault: false },
      });

      await tx.bankBeneficiary.create({
        data: {
          storeId,
          bankName: state.finance.bankName ?? '',
          accountNumber: state.finance.accountNumber ?? '',
          accountName: state.finance.accountName ?? '',
          bankCode: state.finance.bankCode || '000',
          isDefault: true,
        },
      });
    }
  }

  private async syncDeliverySettings(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ) {
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

  private async syncKycStatus(
    tx: Prisma.TransactionClient,
    storeId: string,
    state: OnboardingState
  ) {
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
}

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
