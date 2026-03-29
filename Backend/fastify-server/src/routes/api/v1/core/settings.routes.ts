import { FastifyPluginAsync } from 'fastify';
import { SettingsService } from '../../../../services/core/settings.service';

const settingsService = new SettingsService();

export const settingsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const settings = await settingsService.getSettings(storeId);
      return reply.send({ success: true, data: settings });
    },
  });

  server.put('/', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const updates = request.body as any;

      try {
        const updated = await settingsService.updateSettings(storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update settings' 
        });
      }
    },
  });

  server.get('/profile', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const profile = await settingsService.getProfile(storeId);
      return reply.send({ success: true, data: profile });
    },
  });

  server.put('/profile', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const updates = request.body as any;

      try {
        const updated = await settingsService.updateProfile(storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update profile' 
        });
      }
    },
  });

  server.get('/payments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const payments = await settingsService.getPayments(storeId);
      return reply.send({ success: true, data: payments });
    },
  });

  server.post('/payments/beneficiaries', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const beneficiaryData = request.body as any;

      try {
        const beneficiary = await settingsService.addBeneficiary(storeId, beneficiaryData);
        return reply.code(201).send({ success: true, data: beneficiary });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to add beneficiary' 
        });
      }
    },
  });

  server.delete('/payments/beneficiaries/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const result = await settingsService.deleteBeneficiary(id, storeId);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to delete beneficiary' 
        });
      }
    },
  });

  server.get('/shipping', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const shipping = await settingsService.getShipping(storeId);
      return reply.send({ success: true, data: shipping });
    },
  });

  server.post('/shipping', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const shippingData = request.body as any;

      try {
        const option = await settingsService.createShippingOption(storeId, shippingData);
        return reply.code(201).send({ success: true, data: option });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create shipping option' 
        });
      }
    },
  });

  server.get('/delivery', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const delivery = await settingsService.getDelivery(storeId);
      return reply.send({ success: true, data: delivery });
    },
  });

  server.post('/delivery', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const deliveryData = request.body as any;

      try {
        const option = await settingsService.createDeliveryOption(storeId, deliveryData);
        return reply.code(201).send({ success: true, data: option });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create delivery option' 
        });
      }
    },
  });

  server.get('/industry', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const industry = await settingsService.getIndustrySettings(storeId);
      return reply.send({ success: true, data: industry });
    },
  });

  server.put('/industry', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const industryData = request.body as any;

      try {
        const updated = await settingsService.updateIndustrySettings(storeId, industryData);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update industry settings' 
        });
      }
    },
  });

  server.get('/whatsapp', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const whatsapp = await settingsService.getWhatsappSettings(storeId);
      return reply.send({ success: true, data: whatsapp });
    },
  });

  server.put('/whatsapp', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const configData = request.body as any;

      try {
        const updated = await settingsService.updateWhatsappSettings(storeId, configData);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update WhatsApp settings' 
        });
      }
    },
  });

  server.get('/whatsapp/templates', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const templates = await settingsService.getWhatsappTemplates(storeId);
      return reply.send({ success: true, data: templates });
    },
  });

  server.get('/roles', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const roles = await settingsService.getRoles(storeId);
      return reply.send({ success: true, data: roles });
    },
  });

  server.post('/roles', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const roleData = request.body as any;

      try {
        const role = await settingsService.createRole(storeId, roleData);
        return reply.code(201).send({ success: true, data: role });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create role' 
        });
      }
    },
  });
};
