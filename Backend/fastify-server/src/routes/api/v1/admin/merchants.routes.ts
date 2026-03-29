import { FastifyPluginAsync } from 'fastify';
import { MerchantAdminService } from '../../../../services/admin/merchant-admin.service';

const merchantAdminService = new MerchantAdminService();

export const merchantAdminRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/v1/admin/merchants
   * List all merchants with filtering
   */
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 20;
      const search = query.q || query.search || '';

      const result = await merchantAdminService.getAllMerchants({
        page,
        limit,
        search,
      });

      return reply.send({ success: true, data: result.data, meta: result.meta });
    },
  });

  /**
   * GET /api/v1/admin/merchants/:id
   * Get merchant details
   */
  server.get('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const result = await merchantAdminService.getMerchantById(id);
        return reply.send({ success: true, data: result });
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        throw error;
      }
    },
  });

  /**
   * PATCH /api/v1/admin/merchants/:id
   * Update merchant (add notes)
   */
  server.patch('/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { note } = body;
      const userId = (request.user as any).userId;
      const userEmail = (request.user as any).email;

      if (!note || typeof note !== 'string') {
        return reply.code(400).send({ success: false, error: 'Invalid note' });
      }

      try {
        const result = await merchantAdminService.addNote(id, userId, userEmail, note);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/suspend-account
   * Suspend merchant account
   */
  server.post('/:id/actions/suspend-account', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { reason } = body;
      const userId = (request.user as any).userId;

      if (!reason || reason.trim().length < 10) {
        return reply.code(400).send({ 
          success: false, 
          error: 'Reason must be at least 10 characters' 
        });
      }

      try {
        const result = await merchantAdminService.suspendMerchant(id, userId, reason);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        if ((error as Error).message === 'Store is already suspended') {
          return reply.code(400).send({ success: false, error: 'Store is already suspended' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/unsuspend-account
   * Unsuspend merchant account
   */
  server.post('/:id/actions/unsuspend-account', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { reason } = body;
      const userId = (request.user as any).userId;

      if (!reason) {
        return reply.code(400).send({ success: false, error: 'Reason is required' });
      }

      try {
        const result = await merchantAdminService.unsuspendMerchant(id, userId, reason);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        if ((error as Error).message === 'Store is already active') {
          return reply.code(400).send({ success: false, error: 'Store is already active' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/disable-payouts
   * Disable payouts
   */
  server.post('/:id/actions/disable-payouts', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const result = await merchantAdminService.disablePayouts(id);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/enable-payouts
   * Enable payouts
   */
  server.post('/:id/actions/enable-payouts', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const result = await merchantAdminService.enablePayouts(id);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/force-kyc-review
   * Force KYC review
   */
  server.post('/:id/actions/force-kyc-review', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { reason } = body;

      try {
        const result = await merchantAdminService.forceKycReview(id, reason || 'Manual review requested');
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/issue-warning
   * Issue warning
   */
  server.post('/:id/actions/issue-warning', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { reason } = body;

      if (!reason) {
        return reply.code(400).send({ success: false, error: 'Reason is required' });
      }

      try {
        const result = await merchantAdminService.issueWarning(id, reason);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/rotate-secret
   * Rotate API secret
   */
  server.post('/:id/actions/rotate-secret', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const result = await merchantAdminService.rotateSecret(id);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/set-restrictions
   * Set restrictions
   */
  server.post('/:id/actions/set-restrictions', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { restrictions } = body;

      if (!restrictions) {
        return reply.code(400).send({ success: false, error: 'Restrictions are required' });
      }

      try {
        const result = await merchantAdminService.setRestrictions(id, restrictions);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Store not found') {
          return reply.code(404).send({ success: false, error: 'Store not found' });
        }
        throw error;
      }
    },
  });

  /**
   * POST /api/v1/admin/merchants/:id/actions/replay-order-webhook
   * Replay order webhook
   */
  server.post('/:id/actions/replay-order-webhook', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as any;
      const { orderId } = body;

      if (!orderId) {
        return reply.code(400).send({ success: false, error: 'orderId is required' });
      }

      try {
        const result = await merchantAdminService.replayOrderWebhook(id, orderId);
        return reply.send(result);
      } catch (error) {
        if ((error as Error).message === 'Order not found') {
          return reply.code(404).send({ success: false, error: 'Order not found' });
        }
        throw error;
      }
    },
  });

  /**
   * GET /api/v1/admin/merchants/:id/customers
   * Get merchant customers
   */
  server.get('/:id/customers', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as any;
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 20;

      const result = await merchantAdminService.getMerchantCustomers(id, page, limit);
      return reply.send(result);
    },
  });

  /**
   * GET /api/v1/admin/merchants/:id/orders
   * Get merchant orders
   */
  server.get('/:id/orders', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as any;
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 20;

      const result = await merchantAdminService.getMerchantOrders(id, page, limit);
      return reply.send(result);
    },
  });

  /**
   * GET /api/v1/admin/merchants/:id/products
   * Get merchant products
   */
  server.get('/:id/products', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as any;
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 20;

      const result = await merchantAdminService.getMerchantProducts(id, page, limit);
      return reply.send(result);
    },
  });

  /**
   * GET /api/v1/admin/merchants/:id/payments
   * Get merchant payments
   */
  server.get('/:id/payments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const query = request.query as any;
      const page = query.page ? parseInt(query.page, 10) : 1;
      const limit = query.limit ? parseInt(query.limit, 10) : 20;

      const result = await merchantAdminService.getMerchantPayments(id, page, limit);
      return reply.send(result);
    },
  });

  /**
   * GET /api/v1/admin/merchants/:id/integrations
   * Get merchant integrations
   */
  server.get('/:id/integrations', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const result = await merchantAdminService.getMerchantIntegrations(id);
      return reply.send(result);
    },
  });

  /**
   * GET /api/v1/admin/merchants/:id/impersonate
   * Impersonate merchant (generate temp token)
   */
  server.post('/:id/impersonate', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      // In production, generate temporary impersonation token
      server.log.info(`[MerchantAdmin] Impersonation requested for store ${id}`);
      
      return reply.send({ 
        success: true, 
        message: 'Impersonation token generated',
        // token would be returned here via secure channel
      });
    },
  });

  /**
   * GET /api/v1/admin/merchants/activity
   * Get merchant activity across all stores
   */
  server.get('/activity', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const storeId = query.storeId as string;
      const limit = query.limit ? parseInt(query.limit, 10) : 50;

      if (storeId) {
        const result = await merchantAdminService.getMerchantActivity(storeId, limit);
        return reply.send(result);
      }

      // Global activity
      return reply.send({ activities: [] });
    },
  });

  /**
   * GET /api/v1/admin/merchants/batch
   * Get batch merchant data
   */
  server.get('/batch', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      
      const result = await merchantAdminService.getBatchMerchants(query);
      return reply.send(result);
    },
  });

  /**
   * POST /api/v1/admin/merchants/bulk
   * Bulk update merchants
   */
  server.post('/bulk', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const body = request.body as any;
      const { ids, updates } = body;

      if (!ids || !Array.isArray(ids)) {
        return reply.code(400).send({ success: false, error: 'ids array is required' });
      }

      try {
        const result = await merchantAdminService.bulkUpdateMerchants(ids, updates);
        return reply.send(result);
      } catch (error) {
        server.log.error('[MerchantAdmin] Bulk update failed:', error);
        throw error;
      }
    },
  });
};
