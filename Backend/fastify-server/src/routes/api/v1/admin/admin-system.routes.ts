import { FastifyPluginAsync } from 'fastify';
import { AdminSystemService } from '../../../../services/admin/admin-system.service';

const adminSystemService = new AdminSystemService();

export const adminSystemRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/admin/audit
   * Get system audit logs
   */
  server.get('/audit', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const limit = query.limit ? parseInt(query.limit, 10) : 100;

      const result = await adminSystemService.getAuditLogs(limit);
      return reply.send(result);
    },
  });

  /**
   * GET /api/v1/admin/database/health
   * Get database health status
   */
  server.get('/database/health', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const result = await adminSystemService.getDatabaseHealth();
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * GET /api/v1/admin/system
   * Get system status
   */
  server.get('/system', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const result = await adminSystemService.getSystemStatus();
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * GET /api/v1/admin/feature-flags
   * Get all feature flags
   */
  server.get('/feature-flags', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const result = await adminSystemService.getFeatureFlags();
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/admin/feature-flags
   * Create/update feature flag
   */
  server.post('/feature-flags', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const body = request.body as any;
      const { id, name, enabled, description, metadata } = body;

      if (!name || typeof enabled !== 'boolean') {
        return reply.code(400).send({ 
          success: false, 
          error: 'name and enabled are required' 
        });
      }

      try {
        const flag = await adminSystemService.upsertFeatureFlag({
          id,
          name,
          enabled,
          description,
          metadata,
        });
        return reply.send({ success: true, data: flag });
      } catch (error) {
        server.log.error('[AdminSystem] Feature flag upsert failed:', error);
        throw error;
      }
    },
  });

  /**
   * DELETE /api/v1/admin/feature-flags/:id
   * Delete feature flag
   */
  server.delete('/feature-flags/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const result = await adminSystemService.deleteFeatureFlag(id);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Record to delete does not exist.') {
          return reply.code(404).send({ success: false, error: 'Flag not found' });
        }
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/admin/team
   * Get team members
   */
  server.get('/team', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const result = await adminSystemService.getTeamMembers();
      return reply.send({ success: true, data: result });
    },
  });

  /**
   * POST /api/v1/admin/team
   * Add team member
   */
  server.post('/team', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const body = request.body as any;
      const { email, name, role } = body;

      if (!email || !name || !role) {
        return reply.code(400).send({ 
          success: false, 
          error: 'email, name, and role are required' 
        });
      }

      try {
        const user = await adminSystemService.addTeamMember({ email, name, role });
        return reply.send({ success: true, data: user });
      } catch (error) {
        if ((error as Error).message === 'User already exists') {
          return reply.code(400).send({ success: false, error: 'User already exists' });
        }
        throw error;
      }
    },
  });

  /**
   * PATCH /api/v1/admin/team/:id
   * Update team member role
   */
  server.patch('/team/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { role } = body;

      if (!role) {
        return reply.code(400).send({ success: false, error: 'role is required' });
      }

      try {
        const user = await adminSystemService.updateTeamRole(id, role);
        return reply.send({ success: true, data: user });
      } catch (error) {
        if ((error as Error).message.includes('not found')) {
          return reply.code(404).send({ success: false, error: 'User not found' });
        }
        throw error;
      }
    },
  });

  /**
   * DELETE /api/v1/admin/team/:id
   * Remove team member
   */
  server.delete('/team/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const result = await adminSystemService.removeTeamMember(id);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message.includes('not found')) {
          return reply.code(404).send({ success: false, error: 'User not found' });
        }
        throw error;
      }
    },
  });
};
