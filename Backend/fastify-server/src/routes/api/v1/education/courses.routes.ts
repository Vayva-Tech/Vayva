import { FastifyPluginAsync } from 'fastify';
import { EducationCoursesService } from '../../../../services/education/courses.service';

const educationService = new EducationCoursesService();

export const educationRoutes: FastifyPluginAsync = async (server) => {
  server.get('/courses', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const courses = await educationService.getCourses(storeId);
      return reply.send({ success: true, data: courses });
    },
  });

  server.get('/courses/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await educationService.getCourseStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
