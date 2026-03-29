import { FastifyPluginAsync } from 'fastify';
import { FlagService } from '../../../../services/security/flag.service';
import { z } from 'zod';

const flagService = new FlagService();

export const flagRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/flags/:key/evaluate
   * Evaluate a feature flag for a merchant
   */
  server.get('/flags/:key/evaluate', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        key: z.string(),
      }),
      querystring: z.object({
        merchantId: z.string().uuid().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { key } = request.params;
        const { merchantId } = request.query;

        const result = await flagService.evaluateFlag(key, merchantId);

        return reply.send(result);
      } catch (error) {
        server.log.error('[FlagRoute] Evaluate failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/flags/all
   * Get all flags for a merchant
   */
  server.get('/flags/all', {
    preHandler: [server.authenticate],
    schema: {
      querystring: z.object({
        merchantId: z.string().uuid().optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { merchantId } = request.query;

        const flags = await flagService.getAllFlags(merchantId);

        return reply.send({ success: true, data: flags });
      } catch (error) {
        server.log.error('[FlagRoute] Get all flags failed', error);
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/flags/list
   * List all flags (admin)
   */
  server.get('/flags/list', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const flags = await flagService.listFlags();

        return reply.send({ success: true, data: flags });
      } catch (error) {
        server.log.error('[FlagRoute] List flags failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/flags
   * Create or update a feature flag (admin)
   */
  server.post('/flags', {
    preHandler: [server.authenticate],
    schema: {
      body: z.object({
        key: z.string(),
        enabled: z.boolean(),
        description: z.string().optional(),
        merchantBlocklist: z.array(z.string().uuid()).optional(),
        merchantAllowlist: z.array(z.string().uuid()).optional(),
        rolloutPercent: z.number().min(0).max(100).optional(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const config = request.body;

        await flagService.upsertFlag(config);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[FlagRoute] Upsert flag failed', error);
        throw error;
      }
    },
  });

  /**
   * DELETE /api/v1/flags/:key
   * Delete a feature flag (admin)
   */
  server.delete('/flags/:key', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        key: z.string(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { key } = request.params;

        await flagService.deleteFlag(key);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[FlagRoute] Delete flag failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/flags/:key/enable-for-merchant
   * Enable flag for specific merchant (add to allowlist)
   */
  server.post('/flags/:key/enable-for-merchant', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        key: z.string(),
      }),
      body: z.object({
        merchantId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { key } = request.params;
        const { merchantId } = request.body;

        await flagService.enableForMerchant(key, merchantId);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[FlagRoute] Enable for merchant failed', error);
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/flags/:key/disable-for-merchant
   * Disable flag for specific merchant (add to blocklist)
   */
  server.post('/flags/:key/disable-for-merchant', {
    preHandler: [server.authenticate],
    schema: {
      params: z.object({
        key: z.string(),
      }),
      body: z.object({
        merchantId: z.string().uuid(),
      }),
    },
    handler: async (request, reply) => {
      try {
        const { key } = request.params;
        const { merchantId } = request.body;

        await flagService.disableForMerchant(key, merchantId);

        return reply.send({ success: true });
      } catch (error) {
        server.log.error('[FlagRoute] Disable for merchant failed', error);
        throw error;
      }
    },
  });
};
