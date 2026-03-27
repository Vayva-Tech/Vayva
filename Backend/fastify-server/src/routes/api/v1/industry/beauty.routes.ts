import { FastifyPluginAsync } from 'fastify';
import { BeautyService } from '../../../services/industry/beauty.service';

const beautyService = new BeautyService();

export const beautyRoutes: FastifyPluginAsync = async (server) => {
  server.get('/services', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        limit: query.limit ? parseInt(query.limit, 10) : 100,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        category: query.category,
        isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      };

      const result = await beautyService.getServices(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/services', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const serviceData = request.body as any;

      try {
        const service = await beautyService.createService(storeId, serviceData);
        return reply.code(201).send({ success: true, data: service });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create service' 
        });
      }
    },
  });

  server.get('/clients', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        search: query.search,
      };

      const result = await beautyService.getClients(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/clients', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const clientData = request.body as any;

      try {
        const client = await beautyService.createClient(storeId, clientData);
        return reply.code(201).send({ success: true, data: client });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create client' 
        });
      }
    },
  });

  server.get('/appointments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        date: query.date,
        status: query.status,
        clientId: query.clientId,
        serviceId: query.serviceId,
      };

      const result = await beautyService.getAppointments(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/appointments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const appointmentData = request.body as any;

      try {
        const appointment = await beautyService.createAppointment(storeId, appointmentData);
        return reply.code(201).send({ success: true, data: appointment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create appointment' 
        });
      }
    },
  });

  server.post('/appointments/:id/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { reason } = request.body as any;

      try {
        const appointment = await beautyService.cancelAppointment(id, storeId, reason);
        return reply.send({ success: true, data: appointment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to cancel appointment' 
        });
      }
    },
  });

  server.get('/treatments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const treatments = await beautyService.getTreatments(storeId);
      return reply.send({ success: true, data: treatments });
    },
  });

  server.get('/products/sales', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await beautyService.getProductSales(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await beautyService.getBeautyStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
