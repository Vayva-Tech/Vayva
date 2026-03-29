import { FastifyPluginAsync } from 'fastify';
import { PaymentMethodService } from '../../../../services/financial/paymentMethod.service';

const paymentMethodService = new PaymentMethodService();

export const paymentMethodsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const paymentMethods = await paymentMethodService.getPaymentMethods(storeId);
        return reply.send({ 
          success: true, 
          data: paymentMethods,
          count: paymentMethods.length 
        });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch payment methods' 
        });
      }
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const paymentData = request.body as any;

      try {
        const paymentMethod = await paymentMethodService.createPaymentMethod(storeId, userId, paymentData);
        return reply.code(201).send({ 
          success: true, 
          data: paymentMethod,
          message: 'Payment method saved successfully'
        });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to save payment method' 
        });
      }
    },
  });

  server.delete('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await paymentMethodService.deletePaymentMethod(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete payment method' 
        });
      }
    },
  });
};
