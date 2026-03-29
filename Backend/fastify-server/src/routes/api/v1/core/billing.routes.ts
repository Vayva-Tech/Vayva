import { FastifyPluginAsync } from 'fastify';
import { SubscriptionsService } from '../../../../services/core/subscriptions.service';

const subscriptionsService = new SubscriptionsService();

export const billingRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/billing/current - Get current subscription details
   */
  server.get('/current', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const subscription = await subscriptionsService.getCurrentSubscription(storeId);
        
        return reply.send({ 
          success: true, 
          data: {
            planKey: subscription?.planKey || 'STARTER',
            status: subscription?.status || 'INACTIVE',
            currentPeriodStart: subscription?.currentPeriodStart,
            currentPeriodEnd: subscription?.currentPeriodEnd,
            trialEndsAt: subscription?.trialEndsAt,
            cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd,
            provider: subscription?.provider,
          }
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch subscription',
        });
      }
    },
  });

  /**
   * GET /api/v1/billing/features - Get available features by plan
   */
  server.get('/features', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const features = await subscriptionsService.getAvailableFeatures(storeId);
        
        return reply.send({ 
          success: true, 
          data: features
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch features',
        });
      }
    },
  });

  /**
   * POST /api/v1/billing/create-checkout - Create Paystack checkout session
   */
  server.post('/create-checkout', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { planKey, billingCycle, successUrl, cancelUrl } = request.body as any;

      try {
        const checkoutSession = await subscriptionsService.createCheckoutSession({
          storeId,
          planKey,
          billingCycle: billingCycle || 'monthly',
          successUrl,
          cancelUrl,
        });

        return reply.send({ 
          success: true, 
          data: checkoutSession 
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create checkout session',
        });
      }
    },
  });

  /**
   * POST /api/v1/billing/create-portal - Create billing portal session
   */
  server.post('/create-portal', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { returnUrl } = request.body as any;

      try {
        const portalSession = await subscriptionsService.createPortalSession({
          storeId,
          returnUrl,
        });

        return reply.send({ 
          success: true, 
          data: portalSession 
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create portal session',
        });
      }
    },
  });

  /**
   * GET /api/v1/billing/usage - Get current usage metrics
   */
  server.get('/usage', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const usage = await subscriptionsService.getUsageMetrics(storeId);
        
        return reply.send({ 
          success: true, 
          data: usage
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch usage',
        });
      }
    },
  });

  /**
   * POST /api/v1/billing/upgrade - Upgrade plan immediately
   */
  server.post('/upgrade', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { targetPlanKey, paymentMethodId } = request.body as any;

      try {
        const result = await subscriptionsService.upgradePlan({
          storeId,
          targetPlanKey,
          paymentMethodId,
        });

        return reply.send({ 
          success: true, 
          data: result 
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to upgrade plan',
        });
      }
    },
  });

  /**
   * POST /api/v1/billing/cancel - Cancel subscription at period end
   */
  server.post('/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { cancellationReason } = request.body as any;

      try {
        const result = await subscriptionsService.cancelAtPeriodEnd({
          storeId,
          cancellationReason,
        });

        return reply.send({ 
          success: true, 
          data: result 
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel subscription',
        });
      }
    },
  });

  /**
   * POST /api/v1/billing/webhook - Paystack webhook handler
   */
  server.post('/webhook', {
    // No authentication - Paystack signatures are verified differently
    handler: async (request, reply) => {
      const eventBody = request.body as any;

      try {
        const result = await subscriptionsService.handlePaystackWebhook({
          eventBody,
        });

        return reply.send({ 
          success: true, 
          data: result 
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Webhook processing failed',
        });
      }
    },
  });
};
