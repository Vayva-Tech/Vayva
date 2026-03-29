import { FastifyPluginAsync } from 'fastify';
import { SupportService } from '../../services/platform/support.service';

export const supportRoutes: FastifyPluginAsync = async (fastify) => {
  const supportService = new SupportService();

  fastify.get('/conversations', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await supportService.getConversations(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.get('/conversations/:id', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const { id } = request.params as { id: string };
      const result = await supportService.getConversationById(id, storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });

  fastify.post('/chat', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const userId = (request as any).user.userId;
      const body = request.body as any;
      
      if (body.conversationId) {
        const result = await supportService.sendMessage(
          body.conversationId,
          userId,
          body.message,
          body.isInternal || false
        );
        return reply.send(result);
      }
      
      // Create new conversation and send first message
      const conversation = await supportService.createConversation(storeId, userId, body);
      const message = await supportService.sendMessage(
        conversation.id,
        userId,
        body.message,
        false
      );
      return reply.send({ conversation, message });
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
