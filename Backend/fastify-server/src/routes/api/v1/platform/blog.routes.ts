import { FastifyPluginAsync } from 'fastify';
import { BlogService } from '../../../../services/platform/blog.service';

const blogService = new BlogService();

export const blogRoutes: FastifyPluginAsync = async (server) => {
  server.get('/posts', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        authorId: query.authorId,
      };

      const result = await blogService.getPosts(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/posts', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const postData = request.body as any;

      try {
        const post = await blogService.createPost(storeId, postData);
        return reply.code(201).send({ success: true, data: post });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create post' 
        });
      }
    },
  });

  server.post('/posts/:id/publish', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const published = await blogService.publishPost(id, storeId);
        return reply.send({ success: true, data: published });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to publish post' 
        });
      }
    },
  });

  server.put('/posts/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const updated = await blogService.updatePost(id, storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update post' 
        });
      }
    },
  });

  server.delete('/posts/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await blogService.deletePost(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete post' 
        });
      }
    },
  });

  server.get('/calendar', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const year = query.year ? parseInt(query.year, 10) : new Date().getFullYear();
      const month = query.month ? parseInt(query.month, 10) : new Date().getMonth() + 1;

      const calendar = await blogService.getCalendar(storeId, year, month);
      return reply.send({ success: true, data: calendar });
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await blogService.getDashboardStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });

  server.get('/newsletter/subscribers', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const subscribers = await blogService.getSubscribers(storeId);
      return reply.send({ success: true, data: subscribers });
    },
  });

  server.post('/newsletter/subscribers', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { email } = request.body as any;

      try {
        const subscriber = await blogService.addSubscriber(storeId, email);
        return reply.code(201).send({ success: true, data: subscriber });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add subscriber' 
        });
      }
    },
  });
};
