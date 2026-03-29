import { FastifyPluginAsync } from 'fastify';
import { KycService, type IdType } from '../../../../services/compliance/kyc.service';

const kycService = new KycService();

export const kycRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/kyc/status - Get current KYC level and limits
  server.get('/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        
        const level = await kycService.getKycLevel(storeId);
        
        return reply.send({
          success: true,
          level,
        });
      } catch (error: any) {
        server.log.error(error, 'Failed to get KYC status');
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to fetch KYC status',
        });
      }
    },
  });

  // POST /api/v1/kyc/submit - Submit KYC information for review
  server.post('/submit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const user = request.user as any;
        
        const {
          idType,
          idNumber,
          idImageUrl,
          cacNumber,
          cacDocumentUrl,
          proofOfAddressUrl,
          consent,
        } = request.body as any;

        // Validate required fields
        if (!idType || !idNumber || !consent) {
          return reply.code(400).send({
            success: false,
            error: 'Missing required fields: idType, idNumber, and consent are required',
          });
        }

        // Validate ID type
        const validIdTypes: IdType[] = ['NIN', 'DRIVERS_LICENSE', 'VOTERS_CARD', 'PASSPORT', 'CAC'];
        if (!validIdTypes.includes(idType)) {
          return reply.code(400).send({
            success: false,
            error: `Invalid ID type. Must be one of: ${validIdTypes.join(', ')}`,
          });
        }

        const result = await kycService.submitForReview(storeId, {
          idType,
          idNumber,
          idImageUrl,
          cacNumber,
          cacDocumentUrl,
          proofOfAddressUrl,
          consent,
          ipAddress: (request.headers['x-forwarded-for'] as string) || 'unknown',
          actorUserId: user.id,
        });

        return reply.code(201).send(result);
      } catch (error: any) {
        server.log.error(error, 'Failed to submit KYC');
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to submit KYC information',
        });
      }
    },
  });

  // POST /api/v1/kyc/skip - Skip KYC for now (Level 0)
  server.post('/skip', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const user = request.user as any;

        const result = await kycService.skipForNow(
          storeId,
          user.id,
          (request.headers['x-forwarded-for'] as string) || 'unknown',
        );

        return reply.code(200).send(result);
      } catch (error: any) {
        server.log.error(error, 'Failed to skip KYC');
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to skip KYC',
        });
      }
    },
  });

  // GET /api/v1/kyc/check-limit - Check if transaction is within daily limit
  server.get('/check-limit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request.user as any).storeId;
        const amount = parseFloat((request.query as any).amount || '0');

        if (isNaN(amount) || amount <= 0) {
          return reply.code(400).send({
            success: false,
            error: 'Invalid amount parameter',
          });
        }

        const result = await kycService.checkDailyLimit(storeId, amount);

        return reply.send({
          success: true,
          ...result,
        });
      } catch (error: any) {
        server.log.error(error, 'Failed to check daily limit');
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to check daily limit',
        });
      }
    },
  });

  // ADMIN ROUTES BELOW

  // GET /api/v1/kyc/admin/pending - Get all pending KYC submissions
  server.get('/admin/pending', {
    preHandler: [server.authenticate, server.requireAdmin],
    handler: async (request, reply) => {
      try {
        const result = await kycService.getPendingSubmissions();
        return reply.send(result);
      } catch (error: any) {
        server.log.error(error, 'Failed to fetch pending KYC submissions');
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to fetch pending submissions',
        });
      }
    },
  });

  // POST /api/v1/kyc/admin/:id/review - Review and approve/reject KYC submission
  server.post<{ Params: { id: string }; Body: { approved: boolean; notes?: string } }>(
    '/admin/:id/review',
    {
      preHandler: [server.authenticate, server.requireAdmin],
      handler: async (request, reply) => {
        try {
          const { id } = request.params;
          const { approved, notes } = request.body;
          const user = request.user as any;

          if (typeof approved !== 'boolean') {
            return reply.code(400).send({
              success: false,
              error: 'approved field must be a boolean',
            });
          }

          const result = await kycService.reviewSubmission(id, approved, user.id, notes);

          return reply.send(result);
        } catch (error: any) {
          server.log.error(error, 'Failed to review KYC submission');
          return reply.code(500).send({
            success: false,
            error: error.message || 'Failed to review KYC submission',
          });
        }
      },
    }
  );

  // GET /api/v1/kyc/admin/:id/decrypted - Get decrypted KYC data (sensitive)
  server.get<{ Params: { id: string } }>('/admin/:id/decrypted', {
    preHandler: [server.authenticate, server.requireAdmin],
    handler: async (request, reply) => {
      try {
        const { id } = request.params;

        const result = await kycService.getDecryptedData(id);

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error: any) {
        server.log.error(error, 'Failed to fetch decrypted KYC data');
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to fetch decrypted data',
        });
      }
    },
  });
};
