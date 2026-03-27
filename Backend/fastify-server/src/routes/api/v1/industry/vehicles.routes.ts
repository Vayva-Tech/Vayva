import { FastifyPluginAsync } from 'fastify';
import { VehicleService } from '../../../services/industry/vehicle.service';

const vehicleService = new VehicleService();

export const vehicleRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        status: query.status,
      };

      const vehicles = await vehicleService.findAll(storeId, filters);
      return reply.send({ success: true, data: vehicles, total: vehicles.length });
    },
  });

  server.post('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const data = request.body as any;

      try {
        const vehicle = await vehicleService.create(storeId, data);
        return reply.code(201).send({ success: true, data: vehicle });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create vehicle',
        });
      }
    },
  });

  server.get('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const vehicle = await vehicleService.findOne(id, storeId);
        return reply.send({ success: true, data: vehicle });
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: error instanceof Error ? error.message : 'Vehicle not found',
        });
      }
    },
  });

  server.put('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const data = request.body as any;

      try {
        const vehicle = await vehicleService.update(id, storeId, data);
        return reply.send({ success: true, data: vehicle });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update vehicle',
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
        await vehicleService.delete(id, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete vehicle',
        });
      }
    },
  });
};
