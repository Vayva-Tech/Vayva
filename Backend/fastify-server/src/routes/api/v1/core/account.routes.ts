import { FastifyPluginAsync } from 'fastify';
import { AccountService } from '../../../services/core/account.service';

const accountService = new AccountService();

export const accountRoutes: FastifyPluginAsync = async (server) => {
  server.get('/profile', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const userId = (request.user as any).userId;
      const profile = await accountService.getProfile(userId);
      return reply.send({ success: true, data: profile });
    },
  });

  server.put('/profile', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const userId = (request.user as any).userId;
      const updates = request.body as any;

      try {
        const updated = await accountService.updateProfile(userId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update profile' 
        });
      }
    },
  });

  server.get('/overview', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const overview = await accountService.getOverview(storeId);
      return reply.send({ success: true, data: overview });
    },
  });

  server.get('/security/status', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const userId = (request.user as any).userId;
      const status = await accountService.getSecurityStatus(userId);
      return reply.send({ success: true, data: status });
    },
  });

  server.post('/security/change-password', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const userId = (request.user as any).userId;
      const passwordData = request.body as any;

      try {
        const result = await accountService.changePassword(userId, passwordData);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to change password' 
        });
      }
    },
  });

  server.post('/otp/send', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const userId = (request.user as any).userId;
      const type = (request.body as any).type || 'email';

      try {
        const result = await accountService.sendOtp(userId, type);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to send OTP' 
        });
      }
    },
  });

  server.post('/otp/verify', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const userId = (request.user as any).userId;
      const otpData = request.body as any;

      try {
        const result = await accountService.verifyOtp(userId, otpData);
        return reply.send({ success: true, data: result });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to verify OTP' 
        });
      }
    },
  });

  server.post('/deletion', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const userId = (request.user as any).userId;
      const reason = (request.body as any).reason || '';

      try {
        const deletionRequest = await accountService.requestDeletion(userId, reason);
        return reply.code(201).send({ success: true, data: deletionRequest });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to request deletion' 
        });
      }
    },
  });

  server.get('/governance', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const governance = await accountService.getGovernance(storeId);
      return reply.send({ success: true, data: governance });
    },
  });

  server.get('/store', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const store = await accountService.getStore(storeId);
      return reply.send({ success: true, data: store });
    },
  });

  // Onboarding Management
  server.get('/onboarding/state', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const state = await accountService.getOnboardingState(storeId);
      return reply.send({ success: true, data: state });
    },
  });

  server.put('/onboarding/state', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const updates = request.body as any;

      try {
        const updated = await accountService.updateOnboardingState(storeId, updates);
        return reply.send({ success: true, data: updated });
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update onboarding state',
        });
      }
    },
  });

  server.get('/onboarding/check-slug', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const query = request.query as any;
      const slug = query.slug;

      if (!slug) {
        return reply.code(400).send({ error: 'Slug is required' });
      }

      const result = await accountService.checkSlugAvailability(slug);
      return reply.send({ success: true, data: result });
    },
  });
};
