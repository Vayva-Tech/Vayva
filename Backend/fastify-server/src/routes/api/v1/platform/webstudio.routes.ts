import { FastifyPluginAsync } from 'fastify';
import { WebstudioService } from '../../../services/platform/webstudio.service';

const webstudioService = new WebstudioService();

export const webstudioRoutes: FastifyPluginAsync = async (server) => {
  server.get('/config', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      try {
        const config = await webstudioService.getStudioConfig(storeId);
        return reply.send({ success: true, data: config });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch config' 
        });
      }
    },
  });

  server.put('/config', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const config = request.body as any;

      try {
        const updated = await webstudioService.updateStudioConfig(storeId, config);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update config' 
        });
      }
    },
  });

  server.post('/publish', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;

      try {
        const result = await webstudioService.publishChanges(storeId, userId);
        return reply.code(201).send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to publish' 
        });
      }
    },
  });

  server.post('/projects', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { templateProjectId } = request.body as any;

      if (!templateProjectId) {
        return reply.code(400).send({ 
          success: false, 
          error: 'templateProjectId is required' 
        });
      }

      try {
        const result = await webstudioService.createProject(storeId, templateProjectId);
        return reply.code(201).send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create project' 
        });
      }
    },
  });

  server.post('/projects/:id/export', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const userId = (request.user as any).userId;
      const { id } = request.params as any;

      try {
        const result = await webstudioService.exportProject(id, storeId, userId);
        return reply.code(202).send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to export project' 
        });
      }
    },
  });
};
