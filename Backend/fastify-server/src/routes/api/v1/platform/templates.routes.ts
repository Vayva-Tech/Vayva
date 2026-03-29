import { FastifyPluginAsync } from 'fastify';
import { TemplateService } from '../../../../services/platform/template.service';

const templateService = new TemplateService();

export const templatesRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      
      try {
        const templates = await templateService.findAll(storeId);
        return reply.send({ success: true, data: templates });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to fetch templates' 
        });
      }
    },
  });
};
