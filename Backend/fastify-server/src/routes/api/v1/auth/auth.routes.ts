import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  SignInSchema,
  SignUpSchema,
  VerifyOTPSchema,
  ResendOTPSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
} from './auth.schema';

export async function authRoutes(server: FastifyInstance) {
  // Initialize auth service and controller
  const authService = new AuthService(server);
  const authController = new AuthController(server, authService);

  // ============================================================================
  // LEGACY ROUTES (Keep for backward compatibility)
  // ============================================================================
  
  // POST /api/v1/auth/login - Legacy user login (will be deprecated)
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
    handler: async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      // Delegate to new auth controller for consistency
      return authController.login(request, reply);
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

  // ============================================================================
  // MERCHANT AUTHENTICATION ROUTES (New endpoints for frontend)
  // ============================================================================

  // POST /api/auth/merchant/login - Merchant login with OTP support
  server.post('/merchant/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          otpMethod: { type: 'string', enum: ['EMAIL', 'WHATSAPP'] },
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
                    role: { type: 'string' },
                  },
                },
                merchant: { type: 'object' },
                requiresOTP: { type: 'boolean' },
                otpMethod: { type: 'string' },
                maskedPhone: { type: 'string' },
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
    handler: async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      return authController.login(request, reply);
    },
  });

  // POST /api/auth/merchant/register - New merchant registration
  server.post('/merchant/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName', 'storeName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          storeName: { type: 'string' },
          industrySlug: { type: 'string' },
          otpMethod: { type: 'string', enum: ['EMAIL', 'WHATSAPP'] },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
                email: { type: 'string' },
                requiresVerification: { type: 'boolean' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
        409: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      return authController.register(request, reply);
    },
  });

  // POST /api/auth/merchant/verify-otp - Verify OTP code
  server.post('/merchant/verify-otp', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: { type: 'string', format: 'email' },
          code: { type: 'string', maxLength: 6, minLength: 6 },
          method: { type: 'string', enum: ['EMAIL', 'WHATSAPP'] },
          rememberMe: { type: 'boolean' },
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
                    role: { type: 'string' },
                  },
                },
                merchant: { type: 'object' },
              },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      return authController.verifyOTP(request, reply);
    },
  });

  // POST /api/auth/merchant/resend-otp - Resend OTP code
  server.post('/merchant/resend-otp', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          method: { type: 'string', enum: ['EMAIL', 'WHATSAPP'] },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
        429: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      return authController.resendOTP(request, reply);
    },
  });

  // POST /api/auth/forgot-password - Request password reset
  server.post('/forgot-password', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      return authController.forgotPassword(request, reply);
    },
  });

  // POST /api/auth/reset-password - Reset password with token
  server.post('/reset-password', {
    schema: {
      body: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: { type: 'string' },
          password: { type: 'string', minLength: 8 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Body: any }>, reply: FastifyReply) => {
      return authController.resetPassword(request, reply);
    },
  });
}

export default authRoutes;
