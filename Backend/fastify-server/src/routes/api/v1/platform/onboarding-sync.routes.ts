import { FastifyPluginAsync } from 'fastify';
import { OnboardingService } from '../../../../services/security/onboarding.service';
import { z } from 'zod';

const onboardingService = new OnboardingService();

// Schema for onboarding state validation
const onboardingStateSchema = z.object({
  schemaVersion: z.number().optional(),
  industrySlug: z.string().optional(),
  kycStatus: z.string().optional(),
  business: z.object({
    slug: z.string().optional(),
    name: z.string().optional(),
    storeName: z.string().optional(),
    category: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    legalName: z.string().optional(),
    email: z.string().email().optional(),
    registeredAddress: z.object({
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      landmark: z.string().optional(),
    }).optional(),
  }).optional(),
  storeDetails: z.object({
    slug: z.string().optional(),
    domainPreference: z.string().optional(),
    publishStatus: z.string().optional(),
  }).optional(),
  finance: z.object({
    currency: z.string().optional(),
    payoutScheduleAcknowledged: z.boolean().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    bankCode: z.string().optional(),
  }).optional(),
  whatsapp: z.object({
    number: z.string().optional(),
  }).optional(),
  identity: z.object({
    phone: z.string().optional(),
  }).optional(),
  logistics: z.object({
    deliveryMode: z.string().optional(),
    pickupAddress: z.string().optional(),
  }).optional(),
});

export const onboardingSyncRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/onboarding/sync
   * Sync complete onboarding data
   */
  server.post('/sync', {
    preHandler: [server.authenticate],
    schema: {
      body: onboardingStateSchema,
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const state = request.body as Record<string, unknown>;

        await onboardingService.syncOnboardingData(storeId, state);
        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[OnboardingRoute] Sync failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/onboarding/status
   * Get current onboarding status
   */
  server.get('/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        const [store, profile, kyc] = await Promise.all([
          server.prisma.store.findUnique({ where: { id: storeId } }),
          server.prisma.storeProfile.findUnique({ where: { storeId } }),
          server.prisma.kycRecord.findUnique({ where: { storeId } }),
        ]);

        return reply.send({
          store,
          profile,
          kyc,
        });
      } catch (error) {
        server.log.error('[OnboardingRoute] Status check failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/onboarding/progress
   * Get onboarding progress percentage
   */
  server.get('/progress', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        const progress = await onboardingService.getOnboardingProgress(storeId);
        
        return reply.send(progress);
      } catch (error) {
        server.log.error('[OnboardingRoute] Progress check failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/onboarding/check-slug
   * Check if a store slug is available
   */
  server.post('/check-slug', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        slug: z.string().min(1),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { slug } = request.body;
        
        const result = await onboardingService.checkSlugAvailability(slug);
        
        return reply.send(result);
      } catch (error) {
        server.log.error('[OnboardingRoute] Slug check failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/onboarding/step
   * Update onboarding step completion
   */
  server.post('/step', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        step: z.string(),
        completed: z.boolean(),
        data: z.record(z.unknown()).optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const { step, completed, data } = request.body;
        
        const result = await onboardingService.updateOnboardingStep(
          storeId,
          step,
          completed,
          data
        );
        
        return reply.send({ success: result });
      } catch (error) {
        server.log.error('[OnboardingRoute] Step update failed', error);
        throw error;
      }
    },
  });
};
