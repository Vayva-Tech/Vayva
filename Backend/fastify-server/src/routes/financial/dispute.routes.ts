import { FastifyPluginAsync } from 'fastify';
import { DisputeRefundService } from '../services/financial/dispute-refund.service';
import { z } from 'zod';

export const disputeRoutes: FastifyPluginAsync = async (fastify) => {
  const disputeRefundService = new DisputeRefundService();

  // POST /api/refund/initiate - Initiate refund
  fastify.post('/refund/initiate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          transactionReference: { type: 'string' },
          amountKobo: { type: 'number' },
          reason: { type: 'string' },
          customerNote: { type: 'string' },
        },
        required: ['transactionReference', 'reason'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        
        const result = await disputeRefundService.initiateRefund(storeId, {
          transactionReference: body.transactionReference,
          amountKobo: body.amountKobo,
          reason: body.reason,
          customerNote: body.customerNote,
        });
        
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

  // GET /api/refund/list - Get refunds for store
  fastify.get('/refund/list', {
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
        const storeId = (request as any).user.storeId;
        const query = request.query as any;
        
        const refunds = await disputeRefundService.getStoreRefunds(
          storeId,
          query.limit
        );
        
        return reply.send({
          success: true,
          data: refunds,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/dispute/create - Create dispute
  fastify.post('/dispute/create', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          transactionReference: { type: 'string' },
          reason: { type: 'string' },
          description: { type: 'string' },
          evidence: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                url: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
        required: ['transactionReference', 'reason', 'description'],
      },
    },
    handler: async (request, reply) => {
      try {
        // For customers, use userId as customerId
        const userId = (request as any).user.userId;
        const body = request.body as any;
        
        const result = await disputeRefundService.createDispute(userId, {
          transactionReference: body.transactionReference,
          reason: body.reason,
          description: body.description,
          evidence: body.evidence,
        });
        
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

  // POST /api/dispute/evidence - Add evidence to dispute
  fastify.post('/dispute/evidence', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          disputeId: { type: 'string' },
          evidenceType: { type: 'string', enum: ['document', 'image', 'message'] },
          url: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['disputeId', 'evidenceType', 'url'],
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body as any;
        
        // Determine who's submitting (customer or merchant)
        const storeId = (request as any).user.storeId;
        const submittedBy = storeId ? 'merchant' : 'customer';
        
        const result = await disputeRefundService.addDisputeEvidence(
          body.disputeId,
          {
            evidenceType: body.evidenceType,
            url: body.url,
            description: body.description,
            submittedBy,
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

  // POST /api/dispute/resolve - Resolve dispute (admin only)
  fastify.post('/dispute/resolve', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          disputeId: { type: 'string' },
          resolution: { 
            type: 'string', 
            enum: ['customer_won', 'merchant_won', 'compromise'] 
          },
          notes: { type: 'string' },
          refundAmountKobo: { type: 'number' },
        },
        required: ['disputeId', 'resolution', 'notes'],
      },
    },
    handler: async (request, reply) => {
      try {
        const userId = (request as any).user.userId;
        const body = request.body as any;
        
        // Check if user is admin (you'll need to implement this check)
        const isAdmin = (request as any).user.role === 'admin';
        if (!isAdmin) {
          return reply.status(403).send({
            success: false,
            message: 'Only admins can resolve disputes',
          });
        }
        
        const result = await disputeRefundService.resolveDispute(
          body.disputeId,
          {
            resolution: body.resolution,
            notes: body.notes,
            refundAmountKobo: body.refundAmountKobo,
            resolvedBy: userId,
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

  // GET /api/dispute/list - Get disputes for store
  fastify.get('/dispute/list', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const query = request.query as any;
        
        const disputes = await disputeRefundService.getStoreDisputes(
          storeId,
          query.status
        );
        
        return reply.send({
          success: true,
          data: disputes,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });
};
