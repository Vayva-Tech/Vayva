import { FastifyPluginAsync } from 'fastify';
import { SubscriptionsService } from '../../../services/core/subscriptions.service';

const subscriptionsService = new SubscriptionsService();

export const subscriptionsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        status: query.status,
        provider: query.provider,
      };

      const result = await subscriptionsService.getSubscriptions(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const subscriptionData = request.body as any;

      try {
        const subscription = await subscriptionsService.createSubscription(storeId, subscriptionData);
        return reply.code(201).send({ success: true, data: subscription });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create subscription' 
        });
      }
    },
  });

  server.get('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const subscription = await subscriptionsService.getSubscriptionById(id, storeId);
        return reply.send({ success: true, data: subscription });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Subscription not found' 
        });
      }
    },
  });

  server.put('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const updated = await subscriptionsService.updateSubscription(id, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update subscription' 
        });
      }
    },
  });

  server.post('/:id/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const cancelled = await subscriptionsService.cancelSubscription(id, storeId);
        return reply.send({ success: true, data: cancelled });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
        });
      }
    },
  });

  server.post('/:id/activate', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const activated = await subscriptionsService.activateSubscription(id, storeId);
        return reply.send({ success: true, data: activated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to activate subscription' 
        });
      }
    },
  });

  server.get('/usage/current', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const usage = await subscriptionsService.getSubscriptionUsage(storeId);
      return reply.send({ success: true, data: usage });
    },
  });

  // Box Subscriptions - Subscription Boxes
  server.get('/boxes', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
      };

      const result = await subscriptionsService.getSubscriptionBoxes(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/boxes', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const boxData = request.body as any;

      try {
        const box = await subscriptionsService.createSubscriptionBox(storeId, boxData);
        return reply.code(201).send({ success: true, data: box });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create subscription box',
        });
      }
    },
  });

  server.put('/boxes/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const updated = await subscriptionsService.updateSubscriptionBox(id, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update subscription box',
        });
      }
    },
  });

  // Box Subscriptions - Customer Subscriptions
  server.get('/box-subscriptions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        customerId: query.customerId,
        boxId: query.boxId,
      };

      const result = await subscriptionsService.getBoxSubscriptions(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/box-subscriptions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const subscriptionData = request.body as any;

      try {
        const subscription = await subscriptionsService.createBoxSubscription(storeId, subscriptionData);
        return reply.code(201).send({ success: true, data: subscription });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create box subscription',
        });
      }
    },
  });

  server.put('/box-subscriptions/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const updated = await subscriptionsService.updateBoxSubscription(id, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update box subscription',
        });
      }
    },
  });

  // Dunning Management
  server.get('/dunning/config', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;
      const boxId = query.boxId || null;

      const config = await subscriptionsService.getDunningConfig(storeId, boxId);
      return reply.send({ success: true, data: config });
    },
  });

  server.post('/dunning/config', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const configData = request.body as any;

      try {
        const config = await subscriptionsService.saveDunningConfig(storeId, configData);
        return reply.send({ success: true, data: config });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save dunning config',
        });
      }
    },
  });

  server.post('/dunning/trigger', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { subscriptionId, attemptNumber } = request.body as any;

      try {
        const result = await subscriptionsService.triggerDunning(subscriptionId, attemptNumber);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to trigger dunning',
        });
      }
    },
  });
};
