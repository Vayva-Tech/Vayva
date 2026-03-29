import { FastifyPluginAsync } from 'fastify';
import { IntegrationsService } from '../../services/platform/integrations.service';

export const integrationsRoutes: FastifyPluginAsync = async (fastify) => {
  const integrationsService = new IntegrationsService();

  fastify.get('/instagram/callback', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const query = request.query as Record<string, string | undefined>;
      
      const code = query.code || '';
      const state = query.state || '';
      const expectedState = request.cookies['ig_oauth_state'] || '';

      if (!code) {
        return reply.redirect('/dashboard/socials?ig=error&reason=missing_code');
      }

      const result = await integrationsService.handleInstagramCallback(
        storeId,
        code,
        state,
        expectedState
      );

      if (result.success) {
        // Clear OAuth cookies
        reply.clearCookie('ig_oauth_state');
        reply.clearCookie('ig_oauth_return_to');
        reply.clearCookie('ig_oauth_store_id');
        
        return reply.redirect(result.redirectUrl);
      } else {
        return reply.redirect(result.redirectUrl);
      }
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/instagram/status', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await integrationsService.getInstagramConnection(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.post('/instagram/disconnect', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      await integrationsService.disconnectInstagram(storeId);
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
