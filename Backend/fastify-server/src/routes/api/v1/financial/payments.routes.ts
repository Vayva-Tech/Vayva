import { FastifyPluginAsync } from 'fastify';
import { PaymentsService } from '../../../services/financial/payments.service';

const paymentsService = new PaymentsService();

export const paymentsRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/v1/payments/initialize
   * Initialize a payment
   */
  server.post('/initialize', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const paymentData = request.body as any;

      try {
        const transaction = await paymentsService.initializePayment({
          ...paymentData,
          storeId,
        });
        return reply.code(201).send({ success: true, data: transaction });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to initialize payment' 
        });
      }
    },
  });

  /**
   * POST /api/v1/payments/verify
   * Verify a payment
   */
  server.post('/verify', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { transactionId, verificationData } = request.body as any;

      try {
        const transaction = await paymentsService.verifyPayment(
          transactionId,
          storeId,
          verificationData
        );
        return reply.send({ success: true, data: transaction });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to verify payment' 
        });
      }
    },
  });

  /**
   * POST /api/v1/payments/webhook
   * Process payment webhook
   */
  server.post('/webhook', {
    handler: async (request, reply) => {
      const webhookData = request.body as any;

      try {
        const result = await paymentsService.processWebhook(webhookData);
        return reply.send(result);
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Webhook processing failed' 
        });
      }
    },
  });

  /**
   * POST /api/v1/payments/refund
   * Process refund
   */
  server.post('/refund', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { transactionId, amount, reason } = request.body as any;

      try {
        const refund = await paymentsService.processRefund(transactionId, storeId, {
          amount,
          reason,
        });
        return reply.code(201).send({ success: true, data: refund });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to process refund' 
        });
      }
    },
  });

  /**
   * GET /api/v1/payments/transactions
   * Get payment transactions
   */
  server.get('/transactions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        orderId: query.orderId,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await paymentsService.getTransactions(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * GET /api/v1/payments/transactions/:id
   * Get transaction by ID
   */
  server.get('/transactions/:transactionId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { transactionId } = request.params as any;

      const transaction = await paymentsService.getTransactionById(transactionId, storeId);
      
      if (!transaction) {
        return reply.code(404).send({ success: false, error: 'Transaction not found' });
      }

      return reply.send({ success: true, data: transaction });
    },
  });

  /**
   * GET /api/v1/payments/stats
   * Get payment statistics
   */
  server.get('/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const period = {
        from: query.fromDate ? new Date(query.fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: query.toDate ? new Date(query.toDate) : new Date(),
      };

      const stats = await paymentsService.getPaymentStats(storeId, period);
      return reply.send({ success: true, data: stats });
    },
  });
};
