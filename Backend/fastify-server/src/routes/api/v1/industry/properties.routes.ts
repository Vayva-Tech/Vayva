import { FastifyPluginAsync } from 'fastify';
import { PropertyService } from '../../../../services/industry/property.service';

const propertyService = new PropertyService();

export const propertiesRoutes: FastifyPluginAsync = async (server) => {
  // GET /api/v1/properties - List all properties
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        status: query.status,
        type: query.type,
      };

      const result = await propertyService.findAll(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  // POST /api/v1/properties - Create a new property
  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const data = request.body as any;

      try {
        const result = await propertyService.create(storeId, userId, data);
        return reply.code(201).send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create property',
        });
      }
    },
  });

  // GET /api/v1/properties/:id - Get a single property
  server.get('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const property = await propertyService.findOne(id, storeId);
        return reply.send({ success: true, data: property });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Property not found',
        });
      }
    },
  });

  // PUT /api/v1/properties/:id - Update a property
  server.put('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const { id } = request.params as any;
      const data = request.body as any;

      try {
        const result = await propertyService.update(id, storeId, userId, data);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update property',
        });
      }
    },
  });

  // DELETE /api/v1/properties/:id - Delete a property
  server.delete('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        await propertyService.delete(id, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete property',
        });
      }
    },
  });

  // GET /api/v1/properties/viewings - Get all property viewings
  server.get('/viewings', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;
      const propertyId = query.propertyId;

      const viewings = await propertyService.getViewings(storeId, propertyId);
      return reply.send({ success: true, data: viewings });
    },
  });

  // POST /api/v1/properties/viewings - Schedule a property viewing
  server.post('/viewings', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const data = request.body as any;

      try {
        const viewing = await propertyService.scheduleViewing(storeId, userId, data);
        return reply.code(201).send({ success: true, data: viewing });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to schedule viewing',
        });
      }
    },
  });

  // Real Estate Leads
  server.get('/realestate/leads', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        status: query.status,
        type: query.type,
        source: query.source,
        agentId: query.agentId,
      };

      const result = await propertyService.getRealEstateLeads(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/realestate/leads', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const leadData = request.body as any;

      try {
        const lead = await propertyService.createRealEstateLead(storeId, userId, leadData);
        return reply.code(201).send({ success: true, data: lead });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create lead',
        });
      }
    },
  });

  server.get('/realestate/leads/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const lead = await propertyService.getRealEstateLead(id, storeId);
        return reply.send({ success: true, data: lead });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Lead not found',
        });
      }
    },
  });

  server.put('/realestate/leads/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const updated = await propertyService.updateRealEstateLead(id, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update lead',
        });
      }
    },
  });

  server.post('/realestate/leads/:id/convert', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { customerId } = request.body as any;

      try {
        const updated = await propertyService.convertRealEstateLead(id, storeId, customerId);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to convert lead',
        });
      }
    },
  });

  server.post('/realestate/leads/:id/score', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { score } = request.body as any;

      try {
        const updated = await propertyService.scoreRealEstateLead(id, storeId, score);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to score lead',
        });
      }
    },
  });

  server.get('/realestate/leads/pipeline', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      const pipeline = await propertyService.getLeadPipeline(storeId);
      return reply.send({ success: true, data: pipeline });
    },
  });

  // Real Estate Transactions
  server.get('/realestate/transactions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        status: query.status,
        type: query.type,
      };

      const result = await propertyService.getRealEstateTransactions(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/realestate/transactions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const transactionData = request.body as any;

      try {
        const transaction = await propertyService.createRealEstateTransaction(storeId, transactionData);
        return reply.code(201).send({ success: true, data: transaction });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create transaction',
        });
      }
    },
  });

  server.get('/realestate/transactions/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const transaction = await propertyService.getRealEstateTransaction(id, storeId);
        return reply.send({ success: true, data: transaction });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Transaction not found',
        });
      }
    },
  });

  server.put('/realestate/transactions/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const updated = await propertyService.updateRealEstateTransaction(id, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update transaction',
        });
      }
    },
  });

  server.delete('/realestate/transactions/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await propertyService.deleteRealEstateTransaction(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete transaction',
        });
      }
    },
  });

  server.post('/realestate/transactions/:id/milestones', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const milestoneData = request.body as any;

      try {
        const milestone = await propertyService.addTransactionMilestone(id, storeId, milestoneData);
        return reply.code(201).send({ success: true, data: milestone });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to add milestone',
        });
      }
    },
  });

  // CMA Reports
  server.get('/realestate/cma', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
      };

      const result = await propertyService.getCMAReports(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/realestate/cma', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const reportData = request.body as any;

      try {
        const report = await propertyService.createCMAReport(storeId, reportData);
        return reply.code(201).send({ success: true, data: report });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create CMA report',
        });
      }
    },
  });

  server.get('/realestate/cma/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const report = await propertyService.getCMAReport(id, storeId);
        return reply.send({ success: true, data: report });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'CMA report not found',
        });
      }
    },
  });

  server.delete('/realestate/cma/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await propertyService.deleteCMAReport(id, storeId);
        return reply.send(result);
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete CMA report',
        });
      }
    },
  });

  server.post('/realestate/cma/generate', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const cmaData = request.body as any;

      try {
        const cma = await propertyService.generateCMA(storeId, cmaData);
        return reply.send({ success: true, data: cma });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate CMA',
        });
      }
    },
  });

  // Real Estate Agents
  server.get('/realestate/agents', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      const agents = await propertyService.getRealEstateAgents(storeId);
      return reply.send({ success: true, data: agents });
    },
  });

  server.get('/realestate/agents/:id/performance', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const performance = await propertyService.getAgentPerformance(id, storeId);
      return reply.send({ success: true, data: performance });
    },
  });
};
