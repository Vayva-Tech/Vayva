import { FastifyPluginAsync } from 'fastify';
import { BillingService } from '../../../services/core/billing.service';

const billingService = new BillingService();

export const billingRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const subscription = await billingService.getSubscription(storeId);
      return reply.send({ success: true, data: subscription });
    },
  });

  server.post('/subscription', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const subscriptionData = request.body as any;

      try {
        const subscription = await billingService.getSubscription(storeId);
        if (!subscription) {
          const created = await billingService.getSubscription(storeId);
          return reply.send({ success: true, data: created });
        }
        return reply.send({ success: true, data: subscription });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to get subscription' 
        });
      }
    },
  });

  server.post('/upgrade', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const upgradeData = request.body as any;

      try {
        const updated = await billingService.upgradePlan(storeId, upgradeData);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to upgrade plan' 
        });
      }
    },
  });

  server.post('/downgrade', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const downgradeData = request.body as any;

      try {
        const updated = await billingService.downgradePlan(storeId, downgradeData);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to downgrade plan' 
        });
      }
    },
  });

  server.post('/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const reason = (request.body as any).reason || '';

      try {
        const cancelled = await billingService.cancelSubscription(storeId, reason);
        return reply.send({ success: true, data: cancelled });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
        });
      }
    },
  });

  server.post('/proration/calculate', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { planId } = request.body as any;

      try {
        const proration = await billingService.calculateProration(storeId, planId);
        return reply.send({ success: true, data: proration });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to calculate proration' 
        });
      }
    },
  });

  server.post('/verify-payment', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const paymentData = request.body as any;

      try {
        const payment = await billingService.verifyPayment(storeId, paymentData);
        return reply.code(201).send({ success: true, data: payment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to verify payment' 
        });
      }
    },
  });

  server.post('/verify-template', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { templateId } = request.body as any;

      try {
        const verification = await billingService.verifyTemplate(storeId, templateId);
        return reply.send({ success: true, data: verification });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to verify template' 
        });
      }
    },
  });
};
