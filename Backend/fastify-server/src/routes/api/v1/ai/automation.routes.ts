import { FastifyPluginAsync } from 'fastify';
import { AutomationService } from '../../../services/ai/automation.service';

const automationService = new AutomationService();

export const automationRoutes: FastifyPluginAsync = async (server) => {
  // Get all automation rules
  server.get('/rules', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const result = await automationService.getRules(storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to load automation rules',
        });
      }
    },
  });

  // Create automation rule
  server.post('/rules', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const ruleData = request.body as any;

      try {
        const result = await automationService.createRule(storeId, ruleData);
        return reply.code(201).send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create automation rule',
        });
      }
    },
  });

  // Update automation rule
  server.put('/rules/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const result = await automationService.updateRule(storeId, id, updates);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update automation rule',
        });
      }
    },
  });

  // Delete automation rule
  server.delete('/rules/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await automationService.deleteRule(storeId, id);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete automation rule',
        });
      }
    },
  });

  // Toggle automation rule
  server.post('/rules/:id/toggle', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await automationService.toggleRule(storeId, id);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to toggle automation rule',
        });
      }
    },
  });

  // Execute automation rule (manual trigger)
  server.post('/rules/:id/execute', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const context = request.body as any;

      try {
        const result = await automationService.executeRule(storeId, id, context);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to execute automation rule',
        });
      }
    },
  });
};
