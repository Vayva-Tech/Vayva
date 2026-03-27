import { FastifyPluginAsync } from 'fastify';
import { EducationCoursesService } from '../../services/education/courses.service';

const educationService = new EducationCoursesService();

export const educationRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /education/courses
   * Get all courses for store
   */
  server.get('/courses', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { status, category } = request.query as { status?: string; category?: string };
      
      const courses = await educationService.getCourses(storeId, { status, category });
      return reply.send({ success: true, data: courses });
    },
  });

  /**
   * POST /education/courses
   * Create a new course
   */
  server.post('/courses', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const courseData = request.body as any;

      try {
        const course = await educationService.createCourse({ ...courseData, storeId });
        return reply.send({ success: true, data: course });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Creation failed' 
        });
      }
    },
  });

  /**
   * GET /education/courses/:courseId
   * Get course details
   */
  server.get('/courses/:courseId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { courseId } = request.params as { courseId: string };

      try {
        const course = await educationService.getCourseById(courseId, storeId);
        if (!course) {
          return reply.code(404).send({ success: false, error: 'Course not found' });
        }
        return reply.send({ success: true, data: course });
      } catch (error) {
        return reply.code(404).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Not found' 
        });
      }
    },
  });

  /**
   * PUT /education/courses/:courseId
   * Update course
   */
  server.put('/courses/:courseId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { courseId } = request.params as { courseId: string };
      const updates = request.body as any;

      try {
        const course = await educationService.updateCourse(courseId, storeId, updates);
        return reply.send({ success: true, data: course });
      } catch (error) {
        return reply.code(404).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Update failed' 
        });
      }
    },
  });

  /**
   * DELETE /education/courses/:courseId
   * Delete course
   */
  server.delete('/courses/:courseId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { courseId } = request.params as { courseId: string };

      try {
        await educationService.deleteCourse(courseId, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(404).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Delete failed' 
        });
      }
    },
  });

  /**
   * GET /education/courses/stats
   * Get course statistics
   */
  server.get('/courses/stats', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;

      const stats = await educationService.getCourseStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
