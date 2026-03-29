import { FastifyPluginAsync } from 'fastify';
import { EducationService } from '../../services/industry/education.service';

export const educationRoutes: FastifyPluginAsync = async (fastify) => {
  const educationService = new EducationService();

  fastify.get('/enrollments', async (request, reply) => {
    try {
      const storeId = (request as any).user.storeId;
      const result = await educationService.getEnrollments(storeId);
      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      throw error;
    }
  });
};
