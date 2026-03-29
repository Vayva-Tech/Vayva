 /**
 * Account Management Routes
 * 
 * POST   /api/v1/account-management/request-deletion - Request store deletion
 * POST   /api/v1/account-management/cancel-deletion - Cancel scheduled deletion
 * GET    /api/v1/account-management/status - Get deletion status
 * POST   /api/v1/account-management/execute - Execute scheduled deletion (cron/worker)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AccountManagementService } from '../../../../services/platform/account-management.service';

const RequestDeletionSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  reason: z.string().optional(),
});

const CancelDeletionSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
});

const ExecuteDeletionSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
});

export async function accountManagementRoutes(server: FastifyInstance) {
  /**
   * POST /api/v1/account-management/request-deletion
   * Request account deletion for a store
   */
  server.post('/request-deletion', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['storeId'],
        properties: {
          storeId: { type: 'string', format: 'uuid' },
          reason: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            scheduledFor: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
            blockers: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = RequestDeletionSchema.parse(request.body as any);
        const user = (request.user as any);

        // Verify user has permission to delete this store
        const hasPermission = await server.hasStoreAccess(user.id, body.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ 
            success: false, 
            error: 'Unauthorized' 
          });
        }

        const result = await AccountManagementService.requestDeletion({
          storeId: body.storeId,
          userId: user.id,
          reason: body.reason,
        });

        if (!result.success) {
          return reply.code(400).send(result);
        }

        return reply.code(200).send({
          success: true,
          scheduledFor: result.scheduledFor.toISOString(),
          requestId: result.requestId,
        });
      } catch (error: any) {
        server.log.error(error, '[AccountManagement] Request deletion failed');
        
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
            details: error.errors,
          });
        }

        return reply.code(500).send({
          success: false,
          error: 'Failed to process deletion request',
        });
      }
    },
  });

  /**
   * POST /api/v1/account-management/cancel-deletion
   * Cancel a scheduled deletion
   */
  server.post('/cancel-deletion', {
    preHandler: [server.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['storeId'],
        properties: {
          storeId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = CancelDeletionSchema.parse(request.body as any);
        const user = (request.user as any);

        // Verify user has permission
        const hasPermission = await server.hasStoreAccess(user.id, body.storeId);
        if (!hasPermission) {
          return reply.code(403).send({ 
            success: false, 
            error: 'Unauthorized' 
          });
        }

        const result = await AccountManagementService.cancelDeletion(body.storeId);

        if (!result.success) {
          return reply.code(404).send(result);
        }

        return reply.code(200).send(result);
      } catch (error: any) {
        server.log.error(error, '[AccountManagement] Cancel deletion failed');
        
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
          });
        }

        return reply.code(500).send({
          success: false,
          error: 'Failed to cancel deletion',
        });
      }
    },
  });

  /**
   * GET /api/v1/account-management/status
   * Get current deletion status for a store
   */
  server.get('/status', {
    preHandler: [server.authenticate],
    schema: {
      querystring: {
        type: 'object',
        required: ['storeId'],
        properties: {
          storeId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
                scheduledFor: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = (request.query as any).storeId;
        const user = (request.user as any);

        // Verify user has permission
        const hasPermission = await server.hasStoreAccess(user.id, query);
        if (!hasPermission) {
          return reply.code(403).send({ 
            success: false, 
            error: 'Unauthorized' 
          });
        }

        const status = await AccountManagementService.getStatus(query);

        return reply.code(200).send({
          success: true,
          data: status,
        });
      } catch (error: any) {
        server.log.error(error, '[AccountManagement] Get status failed');
        return reply.code(500).send({
          success: false,
          error: 'Failed to get deletion status',
        });
      }
    },
  });

  /**
   * POST /api/v1/account-management/execute
   * Execute a scheduled deletion (called by cron/worker)
   * This endpoint should be protected with API key or admin auth
   */
  server.post('/execute', {
    // TODO: Add admin-only authentication or API key verification
    // preHandler: [server.authenticateAdmin],
    schema: {
      body: {
        type: 'object',
        required: ['requestId'],
        properties: {
          requestId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = ExecuteDeletionSchema.parse(request.body as any);

        await AccountManagementService.executeDeletion(body.requestId);

        return reply.code(200).send({
          success: true,
        });
      } catch (error: any) {
        server.log.error(error, '[AccountManagement] Execute deletion failed');
        
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid request data',
          });
        }

        return reply.code(500).send({
          success: false,
          error: 'Failed to execute deletion',
        });
      }
    },
  });

  server.log.info('✅ Account management routes registered');
}
