import { FastifyPluginAsync } from 'fastify';
import { OpsAuthService } from '../../../../services/platform/ops-auth.service';

const opsAuthService = new OpsAuthService();

export const opsAuthRoutes: FastifyPluginAsync = async (server) => {
  server.post('/login', {
    handler: async (request, reply) => {
      try {
        const body = request.body as Record<string, unknown>;
        const email = body.email as string;
        const password = body.password as string;
        const ip = request.ip;

        // Check rate limiting
        const isLimited = await opsAuthService.isRateLimited(ip);
        if (isLimited) {
          await opsAuthService.logEvent(null, 'OPS_LOGIN_FAILED', { ip, reason: 'rate_limited' });
          return reply.code(429).send({ error: 'Too many failed attempts. Try again later.' });
        }

        const result = await opsAuthService.login(email, password, ip);
        
        if (!result) {
          await opsAuthService.logEvent(null, 'OPS_LOGIN_FAILED', { ip, email });
          return reply.code(401).send({ error: 'Invalid credentials' });
        }

        reply.setCookie('ops_session_v1', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: result.expiresAt,
          path: '/',
        });

        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/logout', {
    preHandler: [server.authenticateOps],
    handler: async (request, reply) => {
      try {
        const token = (request.cookies as any).ops_session_v1;
        if (token) {
          await opsAuthService.logout(token);
        }
        reply.clearCookie('ops_session_v1');
        return reply.send({ success: true });
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/me', {
    preHandler: [server.authenticateOps],
    handler: async (request, reply) => {
      try {
        const user = (request.user as any);
        return reply.send(user);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.get('/users', {
    preHandler: [server.authenticateOps],
    handler: async (request, reply) => {
      try {
        const users = await opsAuthService.listUsers();
        return reply.send(users);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });

  server.post('/users', {
    preHandler: [server.authenticateOps],
    handler: async (request, reply) => {
      try {
        const currentUserRole = (request.user as any).role;
        const body = request.body as Record<string, string>;
        
        const result = await opsAuthService.createUser(currentUserRole, {
          email: body.email,
          role: body.role,
          name: body.name,
        });
        
        return reply.send(result);
      } catch (error) {
        server.log.error(error);
        throw error;
      }
    },
  });
};
