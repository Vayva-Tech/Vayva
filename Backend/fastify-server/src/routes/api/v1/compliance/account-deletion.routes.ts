import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AccountDeletionService } from '../../../../services/compliance/account-deletion.service';

const requestDeletionSchema = z.object({
  reason: z.string().optional(),
});

const cancelDeletionSchema = z.object({});

const getStatusSchema = z.object({});

export async function registerAccountDeletionRoutes(fastify: FastifyInstance) {
  const service = new AccountDeletionService();

  /**
   * POST /api/v1/compliance/account-deletion/request
   * Request account deletion for the authenticated store
   */
  fastify.post(
    '/compliance/account-deletion/request',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            reason: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              scheduledFor: { type: 'string', format: 'date-time' },
              error: { type: 'string' },
              blockers: { type: 'array', items: { type: 'string' } },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { reason?: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        // Extract storeId and userId from authenticated JWT
        const user = request.user as { storeId: string; userId: string };
        
        if (!user?.storeId || !user?.userId) {
          return reply.status(401).send({ 
            success: false, 
            error: 'Authentication required' 
          });
        }

        const result = await service.requestDeletion(
          user.storeId,
          user.userId,
          request.body.reason
        );

        if (!result.success) {
          return reply.status(400).send(result);
        }

        return reply.code(200).send(result);
      } catch (error) {
        fastify.log.error({ error }, 'Failed to request account deletion');
        return reply.status(500).send({
          success: false,
          error: 'Failed to process deletion request',
        });
      }
    }
  );

  /**
   * POST /api/v1/compliance/account-deletion/cancel
   * Cancel pending deletion request
   */
  fastify.post(
    '/compliance/account-deletion/cancel',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const user = request.user as { storeId: string };
        
        if (!user?.storeId) {
          return reply.status(401).send({ 
            success: false, 
            error: 'Authentication required' 
          });
        }

        const result = await service.cancelDeletion(user.storeId);

        if (!result.success) {
          return reply.status(404).send(result);
        }

        return reply.code(200).send(result);
      } catch (error) {
        fastify.log.error({ error }, 'Failed to cancel account deletion');
        return reply.status(500).send({
          success: false,
          error: 'Failed to cancel deletion request',
        });
      }
    }
  );

  /**
   * GET /api/v1/compliance/account-deletion/status
   * Get current deletion status
   */
  fastify.get(
    '/compliance/account-deletion/status',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              hasPendingDeletion: { type: 'boolean' },
              scheduledFor: { type: 'string', format: 'date-time' },
              storeName: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      try {
        const user = request.user as { storeId: string };
        
        if (!user?.storeId) {
          return reply.status(401).send({ 
            success: false, 
            error: 'Authentication required' 
          });
        }

        const result = await service.getStatus(user.storeId);
        return reply.code(200).send(result);
      } catch (error) {
        fastify.log.error({ error }, 'Failed to get deletion status');
        return reply.status(500).send({
          success: false,
          error: 'Failed to get deletion status',
        });
      }
    }
  );

  /**
   * POST /api/v1/compliance/account-deletion/execute
   * Execute deletion (background job endpoint - should be protected)
   */
  fastify.post(
    '/compliance/account-deletion/execute',
    {
      schema: {
        body: {
          type: 'object',
          required: ['requestId'],
          properties: {
            requestId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { requestId: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        // This should only be called by background jobs
        // Add additional auth check here if needed
        await service.executeDeletion(request.body.requestId);
        return reply.code(200).send({ success: true });
      } catch (error) {
        fastify.log.error({ error }, 'Failed to execute account deletion');
        return reply.status(500).send({
          success: false,
          error: 'Failed to execute deletion',
        });
      }
    }
  );
}
