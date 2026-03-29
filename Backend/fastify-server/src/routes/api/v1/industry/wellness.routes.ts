import { FastifyPluginAsync } from 'fastify';
import { WellnessService } from '../../../../services/industry/wellness.service';

const wellnessService = new WellnessService();

export const wellnessRoutes: FastifyPluginAsync = async (server) => {
  server.get('/appointments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        clientId: query.clientId,
        instructorId: query.instructorId,
        serviceType: query.serviceType,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        location: query.location,
      };

      const result = await wellnessService.findAppointments(storeId, filters);
      return reply.send({ success: true, data: result.data, meta: result.meta });
    },
  });

  server.post('/appointments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const appointment = await wellnessService.createAppointment(storeId, data);
        return reply.code(201).send({ success: true, data: appointment });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create appointment',
        });
      }
    },
  });

  server.patch('/appointments/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { status } = request.body as any;

      try {
        const appointment = await wellnessService.updateAppointmentStatus(id, storeId, status);
        return reply.send({ success: true, data: appointment });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update status',
        });
      }
    },
  });
};
