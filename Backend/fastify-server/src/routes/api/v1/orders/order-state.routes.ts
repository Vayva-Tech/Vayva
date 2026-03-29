import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { OrderStateService } from '../../../../services/orders/order-state.service';

const transitionOrderSchema = z.object({
  orderId: z.string(),
  toStatus: z.enum([
    'UNFULFILLED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'RETURNED',
    'CANCELLED',
  ]),
});

const getStatusSchema = z.object({
  orderId: z.string(),
});

const bulkUpdateSchema = z.object({
  orderIds: z.array(z.string()),
  toStatus: z.enum([
    'UNFULFILLED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'RETURNED',
    'CANCELLED',
  ]),
});

export async function registerOrderStateRoutes(fastify: FastifyInstance) {
  const service = new OrderStateService();

  /**
   * POST /api/v1/orders/state/transition
   * Transition order fulfillment status
   */
  fastify.post(
    '/orders/state/transition',
    {
      schema: {
        body: {
          type: 'object',
          required: ['orderId', 'toStatus'],
          properties: {
            orderId: { type: 'string' },
            toStatus: { 
              type: 'string',
              enum: [
                'UNFULFILLED',
                'PROCESSING',
                'SHIPPED',
                'OUT_FOR_DELIVERY',
                'DELIVERED',
                'RETURNED',
                'CANCELLED',
              ],
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              order: { type: 'object' },
              fromStatus: { type: 'string' },
              toStatus: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { orderId: string; toStatus: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const user = request.user as { storeId: string; userId: string };
        
        if (!user?.storeId || !user?.userId) {
          return reply.status(401).send({ 
            success: false, 
            error: 'Authentication required' 
          });
        }

        // Validate body with Zod
        const parsed = transitionOrderSchema.parse(request.body);
        
        const result = await service.transition(
          parsed.orderId,
          parsed.toStatus,
          user.userId,
          user.storeId
        );

        if (!result.success) {
          return reply.status(400).send(result);
        }

        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid request data',
            details: error.errors,
          });
        }
        
        fastify.log.error({ error }, 'Failed to transition order status');
        return reply.status(500).send({
          success: false,
          error: 'Failed to transition order status',
        });
      }
    }
  );

  /**
   * GET /api/v1/orders/state/status
   * Get current order status
   */
  fastify.get(
    '/orders/state/status',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['orderId'],
          properties: {
            orderId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              order: { type: 'object' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Querystring: { orderId: string };
      }>,
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

        const parsed = getStatusSchema.parse(request.query);
        
        const result = await service.getStatus(parsed.orderId, user.storeId);

        if (!result.success) {
          return reply.status(404).send(result);
        }

        return reply.code(200).send(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid request data',
            details: error.errors,
          });
        }
        
        fastify.log.error({ error }, 'Failed to get order status');
        return reply.status(500).send({
          success: false,
          error: 'Failed to get order status',
        });
      }
    }
  );

  /**
   * POST /api/v1/orders/state/bulk-update
   * Bulk update order statuses
   */
  fastify.post(
    '/orders/state/bulk-update',
    {
      schema: {
        body: {
          type: 'object',
          required: ['orderIds', 'toStatus'],
          properties: {
            orderIds: { 
              type: 'array',
              items: { type: 'string' },
            },
            toStatus: { 
              type: 'string',
              enum: [
                'UNFULFILLED',
                'PROCESSING',
                'SHIPPED',
                'OUT_FOR_DELIVERY',
                'DELIVERED',
                'RETURNED',
                'CANCELLED',
              ],
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              count: { type: 'number' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { orderIds: string[]; toStatus: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const user = request.user as { storeId: string; userId: string };
        
        if (!user?.storeId || !user?.userId) {
          return reply.status(401).send({ 
            success: false, 
            error: 'Authentication required' 
          });
        }

        const parsed = bulkUpdateSchema.safeParse(request.body);
        
        if (!parsed.success) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid request data',
            details: parsed.error.errors,
          });
        }

        const result = await service.bulkUpdate(
          parsed.data.orderIds,
          parsed.data.toStatus,
          user.userId,
          user.storeId
        );

        if (!result.success) {
          return reply.status(400).send(result);
        }

        return reply.code(200).send(result);
      } catch (error) {
        fastify.log.error({ error }, 'Failed to bulk update orders');
        return reply.status(500).send({
          success: false,
          error: 'Failed to bulk update orders',
        });
      }
    }
  );
}
