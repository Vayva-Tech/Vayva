import { FastifyPluginAsync } from 'fastify';
import { AffiliatePaymentService } from '../services/financial/affiliate-payment.service';

export const affiliateRoutes: FastifyPluginAsync = async (fastify) => {
  const affiliatePaymentService = new AffiliatePaymentService();

  // GET /api/affiliate/commissions/pending - Get pending commissions
  fastify.get('/commissions/pending', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const userId = (request as any).user.userId;
        
        // Find affiliate by userId
        const affiliate = await fastify.prisma.affiliate.findUnique({
          where: { userId },
        });

        if (!affiliate) {
          return reply.status(404).send({
            success: false,
            message: 'Affiliate not found',
          });
        }

        const result = await affiliatePaymentService.getPendingCommissions(affiliate.id);
        
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // GET /api/affiliate/payouts/history - Get payout history
  fastify.get('/payouts/history', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 20 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const userId = (request as any).user.userId;
        const query = request.query as any;
        
        const affiliate = await fastify.prisma.affiliate.findUnique({
          where: { userId },
        });

        if (!affiliate) {
          return reply.status(404).send({
            success: false,
            message: 'Affiliate not found',
          });
        }

        const payouts = await affiliatePaymentService.getPayoutHistory(
          affiliate.id,
          query.limit
        );
        
        return reply.send({
          success: true,
          data: payouts,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/affiliate/commissions/payout - Process commission payout
  fastify.post('/commissions/payout', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          amountKobo: { type: 'number' },
          bankAccount: {
            type: 'object',
            properties: {
              accountNumber: { type: 'string' },
              bankCode: { type: 'string' },
              accountName: { type: 'string' },
            },
            required: ['accountNumber', 'bankCode', 'accountName'],
          },
          reason: { type: 'string' },
        },
        required: ['amountKobo', 'bankAccount'],
      },
    },
    handler: async (request, reply) => {
      try {
        const userId = (request as any).user.userId;
        const body = request.body as any;
        
        const affiliate = await fastify.prisma.affiliate.findUnique({
          where: { userId },
        });

        if (!affiliate) {
          return reply.status(404).send({
            success: false,
            message: 'Affiliate not found',
          });
        }

        const result = await affiliatePaymentService.processCommissionPayout(
          affiliate.id,
          {
            amountKobo: body.amountKobo,
            bankAccount: body.bankAccount,
            reason: body.reason || 'Affiliate commission payout',
          }
        );
        
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error: any) {
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          message: error.message,
        });
      }
    },
  });
};
