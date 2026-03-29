import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface OnboardingData {
  identity?: any;
  business?: any;
  industrySlug?: string;
  tools?: any;
  finance?: any;
  kyc?: any;
  [key: string]: any;
}

export class OnboardingService {
  constructor(private readonly db = prisma) {}

  async getState(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        industrySlug: true,
        onboardingStep: true,
        onboardingProgress: true,
        isSetupComplete: true,
        onboardingStatus: true,
        createdAt: true,
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Get detailed onboarding data from merchantOnboarding table
    const onboardingRecord = await this.db.merchantOnboarding.findUnique({
      where: { storeId },
    });

    return {
      storeId: store.id,
      currentStep: store.onboardingStep || 'welcome',
      status: store.onboardingStatus || onboardingRecord?.status || 'IN_PROGRESS',
      progress: store.onboardingProgress || 0,
      isComplete: store.isSetupComplete || false,
      data: onboardingRecord?.data || {},
      nextSteps: this.getNextSteps(store),
    };
  }

  async updateState(
    storeId: string,
    data?: OnboardingData,
    step?: string,
    isComplete?: boolean,
    status?: string,
  ) {
    try {
      // Update merchantOnboarding record
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (step) updateData.currentStepKey = step;
      if (status) updateData.status = status;
      if (isComplete === true) {
        updateData.status = 'COMPLETE';
        updateData.completedAt = new Date();
      }
      if (data) {
        // Scrub sensitive PII
        const scrubbed = JSON.parse(JSON.stringify(data));
        if (scrubbed.identity) {
          delete scrubbed.identity.nin;
          delete scrubbed.identity.bvn;
        }
        if (scrubbed.kyc) {
          delete scrubbed.kyc.nin;
          delete scrubbed.kyc.bvn;
        }
        updateData.data = scrubbed;
      }

      const updated = await this.db.merchantOnboarding.upsert({
        where: { storeId },
        create: {
          storeId,
          status: status || 'IN_PROGRESS',
          currentStepKey: step || 'welcome',
          completedSteps: [],
          data: data || {},
          updatedAt: new Date(),
        },
        update: updateData,
      });

      // Sync to Store model
      if (status || step) {
        await this.db.store.update({
          where: { id: storeId },
          data: {
            onboardingStatus: status,
            onboardingStep: step,
          },
        });
      }

      logger.info(`[Onboarding] Updated state for store ${storeId}`, {
        step,
        status,
        isComplete,
      });

      return updated;
    } catch (error) {
      logger.error('[OnboardingService.updateState]', { storeId, error });
      throw error;
    }
  }

  async completeOnboarding(storeId: string, data: OnboardingData) {
    try {
      // Validate KYC is complete
      const hasKyc =
        data.kyc?.nin ||
        data.identity?.nin ||
        !!(await this.db.kycRecord.findFirst({ where: { storeId } }));

      if (!hasKyc) {
        throw new Error('KYC verification is required to complete onboarding');
      }

      // Update onboarding record
      await this.updateState(storeId, data, 'review', true, 'COMPLETE');

      // Update store status
      await this.db.store.update({
        where: { id: storeId },
        data: {
          isSetupComplete: true,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        },
      });

      // Sync industry and business data to store
      if (data.industrySlug) {
        await this.db.store.update({
          where: { id: storeId },
          data: { industrySlug: data.industrySlug },
        });
      }

      if (data.business?.storeName) {
        await this.db.store.update({
          where: { id: storeId },
          data: { name: data.business.storeName },
        });
      }

      logger.info(`[Onboarding] Completed for store ${storeId}`);
    } catch (error) {
      logger.error('[OnboardingService.completeOnboarding]', { storeId, error });
      throw error;
    }
  }

  async skipStep(storeId: string, stepId: string, reason?: string) {
    try {
      // TODO: Check subscription tier - only Pro/Pro+ can skip steps
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: { subscriptionTier: true },
      });

      // For now, allow skipping but log it
      logger.info(`[Onboarding] Step skipped`, {
        storeId,
        stepId,
        reason,
        tier: store?.subscriptionTier || 'unknown',
      });

      // Add to completed steps
      const onboarding = await this.db.merchantOnboarding.findUnique({
        where: { storeId },
      });

      if (onboarding) {
        const completedSteps = Array.isArray(onboarding.completedSteps)
          ? onboarding.completedSteps
          : [];
        if (!completedSteps.includes(stepId)) {
          completedSteps.push(stepId);

          await this.db.merchantOnboarding.update({
            where: { storeId },
            data: { completedSteps },
          });
        }
      }
    } catch (error) {
      logger.error('[OnboardingService.skipStep]', { storeId, error });
      throw error;
    }
  }

  async getIndustryPresets(slug: string) {
    try {
      // Industry-specific onboarding presets
      const presets: Record<string, any> = {
        retail: {
          recommendedTools: ['inventory', 'orders', 'analytics'],
          defaultPolicies: ['shipping', 'returns', 'privacy'],
          kpis: ['revenue', 'orders', 'conversion'],
        },
        fashion: {
          recommendedTools: ['inventory', 'size-guide', 'trend-analysis'],
          defaultPolicies: ['shipping', 'returns', 'exchanges'],
          kpis: ['revenue', 'orders', 'sizing-queries'],
        },
        grocery: {
          recommendedTools: ['inventory', 'expiry-tracking', 'delivery-scheduling'],
          defaultPolicies: ['delivery', 'freshness-guarantee'],
          kpis: ['revenue', 'orders', 'waste-percentage'],
        },
        beauty: {
          recommendedTools: ['appointments', 'services', 'client-management'],
          defaultPolicies: ['cancellation', 'late-arrival'],
          kpis: ['bookings', 'revenue', 'client-retention'],
        },
        food: {
          recommendedTools: ['kitchen-display', 'delivery-routing', 'inventory'],
          defaultPolicies: ['delivery', 'allergens'],
          kpis: ['orders', 'avg-delivery-time', 'food-waste'],
        },
      };

      const preset = presets[slug] || presets.retail;

      return {
        slug,
        ...preset,
      };
    } catch (error) {
      logger.error('[OnboardingService.getIndustryPresets]', { slug, error });
      throw error;
    }
  }

  async completeStep(storeId: string, step: string, data: OnboardingData) {
    try {
      // Get current onboarding
      const onboarding = await this.db.merchantOnboarding.findUnique({
        where: { storeId },
      });

      if (!onboarding) {
        // Initialize if doesn't exist
        await this.db.merchantOnboarding.create({
          data: {
            storeId,
            status: 'IN_PROGRESS',
            currentStepKey: step,
            completedSteps: [step],
            data: data || {},
          },
        });
      } else {
        // Update with new data and mark step as complete
        const completedSteps = Array.isArray(onboarding.completedSteps)
          ? onboarding.completedSteps
          : [];

        if (!completedSteps.includes(step)) {
          completedSteps.push(step);
        }

        // Merge existing data with new data
        const existingData = onboarding.data as OnboardingData;
        const mergedData = { ...existingData, ...data };

        await this.db.merchantOnboarding.update({
          where: { storeId },
          data: {
            data: mergedData,
            completedSteps,
            currentStepKey: step,
          },
        });
      }

      logger.info(`[Onboarding] Step completed: ${step}`, { storeId });

      return { success: true, step };
    } catch (error) {
      logger.error('[OnboardingService.completeStep]', { storeId, step, error });
      throw error;
    }
  }

  private getNextSteps(store: any) {
    const steps: Array<{ step: string; label: string; completed: boolean }> = [];

    const completedSteps = [
      store.name && 'business_info',
      store.industrySlug && 'industry_selection',
      store.isSetupComplete && 'setup_complete',
    ].filter(Boolean);

    const allSteps = [
      { step: 'business_info', label: 'Business Information' },
      { step: 'industry_selection', label: 'Industry Selection' },
      { step: 'payment_setup', label: 'Payment Setup' },
      { step: 'product_catalog', label: 'Product Catalog' },
      { step: 'branding', label: 'Branding & Design' },
      { step: 'team_setup', label: 'Team Setup' },
      { step: 'launch', label: 'Launch' },
    ];

    return allSteps.map((s) => ({
      ...s,
      completed: completedSteps.includes(s.step),
    }));
  }
}
