import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginBody = z.infer<typeof LoginSchema>;

export async function authRoutes(server: FastifyInstance) {
  // POST /api/v1/auth/login - User login
  server.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    storeId: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
      try {
        const { email, password } = request.body;
        
        // TODO: Implement actual authentication logic
        // For now, returning a mock response
        const user = {
          id: 'user_123',
          email,
          storeId: 'store_456',
          role: 'owner',
        };

        const token = server.jwt.sign(user);

        return reply.send({
          success: true,
          data: {
            token,
            user,
          },
        });
      } catch (error) {
        request.log.error(error, 'Login failed');
        return reply.status(500).send({
          success: false,
          error: 'Authentication failed',
        });
      }
    },
  });

  // GET /api/v1/auth/me - Current user info
  server.get('/me', {
    preHandler: [server.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                storeId: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = request.user as any;
        return reply.send({
          success: true,
          data: user,
        });
      } catch (error) {
        request.log.error(error, 'Get current user failed');
        return reply.status(500).send({
          success: false,
          error: 'Failed to get user info',
        });
      }
    },
  });
}

export default authRoutes;
