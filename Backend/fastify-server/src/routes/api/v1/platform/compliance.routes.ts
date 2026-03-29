import { FastifyPluginAsync } from 'fastify';
import { ComplianceService } from '../../../../services/platform/compliance.service';

const complianceService = new ComplianceService();

export const complianceRoutes: FastifyPluginAsync = async (server) => {
  server.post('/gdpr/export', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.body as any).userId || (request.user as any).userId;

      try {
        const exportData = await complianceService.exportGdprData(userId, storeId);
        return reply.send({ success: true, data: exportData });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to export data' 
        });
      }
    },
  });

  server.post('/gdpr/delete', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.body as any).userId || (request.user as any).userId;

      try {
        const result = await complianceService.deleteGdprData(userId, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete data' 
        });
      }
    },
  });

  server.post('/consent', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const consentData = request.body as any;

      try {
        const consent = await complianceService.recordConsent(storeId, consentData);
        return reply.code(201).send({ success: true, data: consent });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to record consent' 
        });
      }
    },
  });

  server.get('/consent/:userId/history', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { userId } = request.params as any;

      const history = await complianceService.getConsentHistory(userId, storeId);
      return reply.send({ success: true, data: history });
    },
  });

  server.post('/kyc/submit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const kycData = request.body as any;

      try {
        const kyc = await complianceService.submitKyc(storeId, kycData);
        return reply.code(201).send({ success: true, data: kyc });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to submit KYC' 
        });
      }
    },
  });

  server.get('/kyc/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const status = await complianceService.getKycStatus(storeId);
      return reply.send({ success: true, data: status });
    },
  });

  server.post('/kyc/cac/submit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const cacData = request.body as any;

      try {
        const submission = await complianceService.submitKycCac(storeId, cacData);
        return reply.code(201).send({ success: true, data: submission });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to submit CAC' 
        });
      }
    },
  });

  server.get('/disputes', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        type: query.type,
      };

      const result = await complianceService.getDisputes(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/disputes', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const disputeData = request.body as any;

      try {
        const dispute = await complianceService.createDispute(storeId, disputeData);
        return reply.code(201).send({ success: true, data: dispute });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create dispute' 
        });
      }
    },
  });

  server.post('/disputes/:id/evidence', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const evidenceData = request.body as any;

      try {
        const evidence = await complianceService.addDisputeEvidence(id, storeId, evidenceData);
        return reply.code(201).send({ success: true, data: evidence });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add evidence' 
        });
      }
    },
  });

  server.get('/appeals', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const appeals = await complianceService.getAppeals(storeId);
      return reply.send({ success: true, data: appeals });
    },
  });

  server.post('/appeals', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const appealData = request.body as any;

      try {
        const appeal = await complianceService.createAppeal(storeId, userId, appealData);
        return reply.code(201).send({ success: true, data: appeal });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create appeal' 
        });
      }
    },
  });

  server.get('/legal/clients', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const clients = await complianceService.getLegalClients(storeId);
      return reply.send({ success: true, data: clients });
    },
  });

  server.post('/legal/clients', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const clientData = request.body as any;

      try {
        const client = await complianceService.createLegalClient(storeId, clientData);
        return reply.code(201).send({ success: true, data: client });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create client' 
        });
      }
    },
  });

  server.get('/legal/clients/:id/cases', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const cases = await complianceService.getClientCases(id, storeId);
      return reply.send({ success: true, data: cases });
    },
  });

  server.get('/legal/timesheets', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        userId: query.userId,
        status: query.status,
      };

      const result = await complianceService.getTimesheets(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/legal/timesheets/:id/approve', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const approved = await complianceService.approveTimesheet(id, storeId);
        return reply.send({ success: true, data: approved });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to approve timesheet' 
        });
      }
    },
  });
};
