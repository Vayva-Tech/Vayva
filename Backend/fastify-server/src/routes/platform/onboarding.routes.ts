import { FastifyPluginAsync } from 'fastify';
import { OnboardingService } from '../../services/platform/onboarding.service';
import { z } from 'zod';

// Validation schemas
const updateOnboardingSchema = z.object({
  data: z.record(z.unknown()).optional(),
  step: z.string().optional(),
  isComplete: z.boolean().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'TRIAL_MODE']).optional(),
});

const completeOnboardingSchema = z.object({
  data: z.record(z.unknown()),
});

const skipOnboardingSchema = z.object({
  reason: z.string().optional(),
});

export const onboardingRoutes: FastifyPluginAsync = async (fastify) => {
  const onboardingService = new OnboardingService();

  /**
   * GET /api/v1/onboarding/state
   * Get current onboarding state
   */
  fastify.get('/state', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            currentStepKey: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const result = await onboardingService.getState(storeId);
        return reply.send({
          success: true,
          data: result.data || {},
          currentStepKey: result.currentStep,
          status: result.status || 'IN_PROGRESS',
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: { code: 'STATE_FETCH_ERROR', message: 'Failed to fetch onboarding state' },
        });
      }
    },
  });

  /**
   * PUT /api/v1/onboarding/state
   * Update onboarding state (save progress)
   */
  fastify.put('/state', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          data: { type: 'object' },
          step: { type: 'string' },
          isComplete: { type: 'boolean' },
          status: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        const parsed = updateOnboardingSchema.parse(body);

        const result = await onboardingService.updateState(
          storeId,
          parsed.data,
          parsed.step,
          parsed.isComplete,
          parsed.status,
        );

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        fastify.log.error(error);
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' },
          });
        }
        return reply.code(500).send({
          success: false,
          error: { code: 'STATE_UPDATE_ERROR', message: 'Failed to update onboarding state' },
        });
      }
    },
  });

  /**
   * POST /api/v1/onboarding/complete
   * Mark onboarding as complete and launch store
   */
  fastify.post('/complete', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
        required: ['data'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        const parsed = completeOnboardingSchema.parse(body);

        await onboardingService.completeOnboarding(storeId, parsed.data);

        return reply.send({
          success: true,
          message: 'Onboarding completed successfully',
        });
      } catch (error) {
        fastify.log.error(error);
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid request data' },
          });
        }
        return reply.code(500).send({
          success: false,
          error: { code: 'COMPLETION_ERROR', message: (error as Error).message },
        });
      }
    },
  });

  /**
   * POST /api/v1/onboarding/skip
   * Skip optional steps (Pro/Pro+ only)
   */
  fastify.post('/skip', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          stepId: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        const parsed = skipOnboardingSchema.parse(body);

        // TODO: Check subscription tier before allowing skip
        await onboardingService.skipStep(storeId, body.stepId, parsed.reason);

        return reply.send({
          success: true,
          message: 'Step skipped successfully',
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(403).send({
          success: false,
          error: { code: 'SKIP_NOT_ALLOWED', message: 'This step cannot be skipped on your plan' },
        });
      }
    },
  });

  /**
   * GET /api/v1/onboarding/industry-presets/:slug
   * Get industry-specific configuration
   */
  fastify.get('/industry-presets/:slug', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
    handler: async (request, reply) => {
      try {
        const { slug } = request.params as { slug: string };
        const presets = await onboardingService.getIndustryPresets(slug);

        return reply.send({
          success: true,
          data: presets,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(404).send({
          success: false,
          error: { code: 'INDUSTRY_NOT_FOUND', message: 'Industry presets not found' },
        });
      }
    },
  });

  /**
   * PATCH /api/v1/onboarding/:step
   * Complete specific onboarding step
   */
  fastify.patch('/:step', {
    preHandler: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        properties: {
          step: { type: 'string' },
        },
        required: ['step'],
      },
      body: {
        type: 'object',
        properties: {
          data: { type: 'object' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const { step } = request.params as { step: string };
        const body = request.body as any;

        const result = await onboardingService.completeStep(storeId, step, body.data);

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: { code: 'STEP_UPDATE_ERROR', message: 'Failed to update step' },
        });
      }
    },
  });
};
