import { FastifyPluginAsync } from 'fastify';
import { CreativeService } from '../../../services/platform/creative.service';

const creativeService = new CreativeService();

export const creativeRoutes: FastifyPluginAsync = async (server) => {
  server.get('/projects', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        status: query.status,
        clientId: query.clientId,
        priority: query.priority,
        search: query.search,
      };

      const result = await creativeService.getProjects(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/projects', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const projectData = request.body as any;

      try {
        const project = await creativeService.createProject(storeId, projectData);
        return reply.code(201).send({ success: true, data: project });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create project' 
        });
      }
    },
  });

  server.get('/clients', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const clients = await creativeService.getClients(storeId);
      return reply.send({ success: true, data: clients });
    },
  });

  server.post('/clients', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const clientData = request.body as any;

      try {
        const client = await creativeService.createClient(storeId, clientData);
        return reply.code(201).send({ success: true, data: client });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create client' 
        });
      }
    },
  });

  server.get('/tasks', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        projectId: query.projectId,
        status: query.status,
        assigneeId: query.assigneeId,
      };

      const result = await creativeService.getTasks(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/tasks', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const taskData = request.body as any;

      try {
        const task = await creativeService.createTask(storeId, taskData);
        return reply.code(201).send({ success: true, data: task });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create task' 
        });
      }
    },
  });

  server.put('/tasks/:id/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { status } = request.body as any;

      try {
        const task = await creativeService.updateTaskStatus(id, storeId, status);
        return reply.send({ success: true, data: task });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update status' 
        });
      }
    },
  });

  server.get('/timesheets', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        taskId: query.taskId,
        userId: query.userId,
        fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
        toDate: query.toDate ? new Date(query.toDate) : undefined,
      };

      const result = await creativeService.getTimesheets(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/timesheets/:id/approve', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const timesheet = await creativeService.approveTimesheet(id, storeId);
        return reply.send({ success: true, data: timesheet });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to approve timesheet' 
        });
      }
    },
  });

  server.get('/invoices', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        clientId: query.clientId,
        status: query.status,
      };

      const result = await creativeService.getInvoices(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.get('/assets', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        projectId: query.projectId,
        type: query.type,
      };

      const result = await creativeService.getAssets(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await creativeService.getCreativeStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
