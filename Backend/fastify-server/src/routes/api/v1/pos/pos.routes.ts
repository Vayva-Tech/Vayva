import { FastifyPluginAsync } from 'fastify';
import { POSSyncService } from '../../services/pos/pos-sync.service';

const posSyncService = new POSSyncService();

export const posRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /pos/devices
   * Get all devices for store
   */
  server.get('/devices', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const devices = await posSyncService.getStoreDevices(storeId);
      return reply.send({ success: true, data: devices });
    },
  });

  /**
   * POST /pos/devices/register
   * Register a new device
   */
  server.post('/devices/register', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const deviceData = request.body as any;

      try {
        const device = await posSyncService.registerDevice({ ...deviceData, storeId });
        return reply.send({ success: true, data: device });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Registration failed' 
        });
      }
    },
  });

  /**
   * PUT /pos/devices/:deviceId/settings
   * Update device settings
   */
  server.put('/devices/:deviceId/settings', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { deviceId } = request.params as { deviceId: string };
      const settings = request.body as any;

      try {
        const device = await posSyncService.updateDeviceSettings(deviceId, storeId, settings);
        return reply.send({ success: true, data: device });
      } catch (error) {
        return reply.code(404).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Update failed' 
        });
      }
    },
  });

  /**
   * POST /pos/devices/:deviceId/sync
   * Trigger sync
   */
  server.post('/devices/:deviceId/sync', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { deviceId } = request.params as { deviceId: string };
      const { syncType } = request.body as { syncType: 'inventory' | 'products' | 'orders' | 'full' };

      try {
        const result = await posSyncService.triggerSync(deviceId, syncType || 'full');
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(500).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Sync failed' 
        });
      }
    },
  });

  /**
   * GET /pos/devices/:deviceId/history
   * Get sync history
   */
  server.get('/devices/:deviceId/history', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const { deviceId } = request.params as { deviceId: string };
      const history = await posSyncService.getSyncHistory(deviceId);
      return reply.send({ success: true, data: history });
    },
  });

  /**
   * DELETE /pos/devices/:deviceId
   * Remove device
   */
  server.delete('/devices/:deviceId', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { deviceId } = request.params as { deviceId: string };

      try {
        await posSyncService.removeDevice(deviceId, storeId);
        return reply.send({ success: true });
      } catch (error) {
        return reply.code(404).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Removal failed' 
        });
      }
    },
  });
};
