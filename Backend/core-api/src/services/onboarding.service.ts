import { prisma, Prisma } from '@vayva/db';
import { logger } from '../lib/logger';

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
  constructor(private readonly db = prisma) {}

  /**
   * Get complete onboarding state for a merchant
   */
  async getOnboardingState(storeId: string): Promise<OnboardingState | null> {
    try {
      const state = await this.db.merchantOnboarding.findUnique({
        where: { storeId },
      });

      if (!state) {
        // Initialize default state
        return this.initializeOnboarding(storeId);
      }

      // Parse JSON fields
      return {
        schemaVersion: state.schemaVersion || undefined,
        industrySlug: state.industrySlug || undefined,
        kycStatus: state.kycStatus || undefined,
        business: state.business as OnboardingState['business'],
        storeDetails: state.storeDetails as OnboardingState['storeDetails'],
        finance: state.finance as OnboardingState['finance'],
        whatsapp: state.whatsapp as OnboardingState['whatsapp'],
        identity: state.identity as OnboardingState['identity'],
        logistics: state.logistics as OnboardingState['logistics'],
      };
    } catch (error) {
      logger.error('[OnboardingService.getOnboardingState]', { storeId, error });
      throw error;
    }
  }

  /**
   * Update a specific onboarding step
   */
  async updateOnboardingStep(
    storeId: string,
    step: keyof Omit<OnboardingState, 'schemaVersion' | 'industrySlug' | 'kycStatus'>,
    data: Record<string, any>
  ): Promise<OnboardingState> {
    try {
      const currentState = await this.getOnboardingState(storeId);

      const updatedData = {
        ...currentState,
        [step]: {
          ...(currentState?.[step] || {}),
          ...data,
        },
      };

      const result = await this.db.merchantOnboarding.update({
        where: { storeId },
        data: {
          [step]: JSON.stringify(updatedData[step]),
          updatedAt: new Date(),
        },
      });

      logger.info('[OnboardingService.updateOnboardingStep]', {
        storeId,
        step,
      });

      return {
        schemaVersion: result.schemaVersion || undefined,
        industrySlug: result.industrySlug || undefined,
        kycStatus: result.kycStatus || undefined,
        business: result.business as OnboardingState['business'],
        storeDetails: result.storeDetails as OnboardingState['storeDetails'],
        finance: result.finance as OnboardingState['finance'],
        whatsapp: result.whatsapp as OnboardingState['whatsapp'],
        identity: result.identity as OnboardingState['identity'],
        logistics: result.logistics as OnboardingState['logistics'],
      };
    } catch (error) {
      logger.error('[OnboardingService.updateOnboardingStep]', {
        storeId,
        step,
        error,
      });
      throw error;
    }
  }

  /**
   * Update KYC status
   */
  async updateKycStatus(
    storeId: string,
    kycStatus: string
  ): Promise<OnboardingState> {
    try {
      const result = await this.db.merchantOnboarding.update({
        where: { storeId },
        data: {
          kycStatus,
          updatedAt: new Date(),
        },
      });

      return {
        schemaVersion: result.schemaVersion || undefined,
        industrySlug: result.industrySlug || undefined,
        kycStatus: result.kycStatus || undefined,
        business: result.business as OnboardingState['business'],
        storeDetails: result.storeDetails as OnboardingState['storeDetails'],
        finance: result.finance as OnboardingState['finance'],
        whatsapp: result.whatsapp as OnboardingState['whatsapp'],
        identity: result.identity as OnboardingState['identity'],
        logistics: result.logistics as OnboardingState['logistics'],
      };
    } catch (error) {
      logger.error('[OnboardingService.updateKycStatus]', {
        storeId,
        kycStatus,
        error,
      });
      throw error;
    }
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(storeId: string): Promise<boolean> {
    try {
      const state = await this.getOnboardingState(storeId);

      if (!state) {
        return false;
      }

      // Check critical steps
      const hasBusiness = !!state.business?.slug && !!state.business?.name;
      const hasStore = !!state.storeDetails?.slug;
      const hasFinance = !!state.finance?.currency;
      const kycApproved = state.kycStatus === 'APPROVED';

      return hasBusiness && hasStore && hasFinance && kycApproved;
    } catch (error) {
      logger.error('[OnboardingService.isOnboardingComplete]', {
        storeId,
        error,
      });
      return false;
    }
  }

  /**
   * Initialize onboarding for a new merchant
   */
  private async initializeOnboarding(storeId: string): Promise<OnboardingState> {
    const result = await this.db.merchantOnboarding.create({
      data: {
        storeId,
        schemaVersion: 1,
        kycStatus: 'PENDING',
      },
    });

    logger.info('[OnboardingService.initializeOnboarding]', { storeId });

    return {
      schemaVersion: result.schemaVersion || undefined,
      industrySlug: result.industrySlug || undefined,
      kycStatus: result.kycStatus || undefined,
      business: result.business as OnboardingState['business'],
      storeDetails: result.storeDetails as OnboardingState['storeDetails'],
      finance: result.finance as OnboardingState['finance'],
      whatsapp: result.whatsapp as OnboardingState['whatsapp'],
      identity: result.identity as OnboardingState['identity'],
      logistics: result.logistics as OnboardingState['logistics'],
    };
  }
}
