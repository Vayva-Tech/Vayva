import { FastifyPluginAsync } from 'fastify';
import { FulfillmentService } from '../../../services/core/fulfillment.service';

const fulfillmentService = new FulfillmentService();

export const fulfillmentRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/fulfillment/shipments - List shipments
  server.get('/shipments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        status: query.status,
        issue: query.issue,
      };

      try {
        const result = await fulfillmentService.getShipments(storeId, filters);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch shipments',
        });
      }
    },
  });

  // POST /api/v1/fulfillment/shipments - Create shipment
  server.post('/shipments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const body = request.body as any;

      try {
        const shipment = await fulfillmentService.createShipment(storeId, body);
        return reply.code(201).send({ success: true, data: shipment });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create shipment',
        });
      }
    },
  });

  // PATCH /api/v1/fulfillment/shipments/:id/status - Update shipment status
  server.patch('/shipments/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { status } = request.body as any;

      if (!status) {
        return reply.code(400).send({
          success: false,
          error: 'Status is required',
        });
      }

      try {
        const updated = await fulfillmentService.updateShipmentStatus(id, storeId, status);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update shipment status',
        });
      }
    },
  });

  // POST /api/v1/fulfillment/shipments/:id/assign-courier - Assign courier
  server.post('/shipments/:id/assign-courier', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const courierData = request.body as any;

      try {
        const updated = await fulfillmentService.assignCourier(id, storeId, courierData);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to assign courier',
        });
      }
    },
  });

  // POST /api/v1/fulfillment/shipments/:id/deliver - Mark as delivered
  server.post('/shipments/:id/deliver', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const proof = request.body as any;

      try {
        const updated = await fulfillmentService.markAsDelivered(id, storeId, proof);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({
            success: false,
            error: error.message,
          });
        }
        return reply.code(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to mark as delivered',
        });
      }
    },
  });
};
