import { FastifyPluginAsync } from 'fastify';
import { DeliveryService } from '../../../../services/platform/delivery.service';

const deliveryService = new DeliveryService();

export const deliveryRoutes: FastifyPluginAsync = async (server) => {
  server.post('/dispatch', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const body = request.body as Record<string, unknown>;
        const orderId = body.orderId as string;
        const channel = body.channel as string;
        const idempotencyKey = body.idempotencyKey as string | undefined;

        const result = await deliveryService.autoDispatch(orderId, channel, idempotencyKey);
        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/orders/:orderId/shipments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const orderId = (request.params as any).orderId;
        const shipments = await deliveryService.getOrderDeliveries(orderId);
        return reply.send(shipments);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.patch('/shipments/:shipmentId/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const shipmentId = (request.params as any).shipmentId;
        const body = request.body as Record<string, string>;
        
        const updated = await deliveryService.updateShipmentStatus(shipmentId, body.status);
        return reply.send(updated);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
