import { FastifyPluginAsync } from 'fastify';
import { RescueService } from '../../../services/platform/rescue.service';

const rescueService = new RescueService();

export const rescueRoutes: FastifyPluginAsync = async (server) => {
  // POST /api/v1/rescue/report - Report an incident
  server.post('/report', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const data = request.body as any;

      try {
        const incident = await rescueService.reportIncident({
          ...data,
          storeId,
          userId,
        });
        return reply.code(201).send({
          incidentId: incident.id,
          status: incident.status,
          message: 'Rescue initiated',
        });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to report incident',
        });
      }
    },
  });

  // GET /api/v1/rescue/incidents - List incidents
  server.get('/incidents', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status,
        severity: query.severity,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
      };

      const incidents = await rescueService.getIncidents(storeId, filters);
      return reply.send({ success: true, data: incidents });
    },
  });

  // GET /api/v1/rescue/incidents/:id/status - Get incident status
  server.get('/incidents/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as any;

      try {
        const incident = await rescueService.getIncidentStatus(id);
        return reply.send({ success: true, data: incident });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Incident not found',
        });
      }
    },
  });
};
