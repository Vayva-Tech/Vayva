/**
 * Authentication Controller
 * Request handlers for merchant authentication endpoints
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import {
  SignInSchema,
  SignUpSchema,
  VerifyOTPSchema,
  ResendOTPSchema,
  RequestPasswordResetSchema,
  ResetPasswordSchema,
} from './auth.schema';
import type {
  SignInRequest,
  SignUpRequest,
  VerifyOTPRequest,
  ResendOTPRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from './auth.types';

export class AuthController {
  constructor(
    private server: FastifyInstance,
    private authService: AuthService
  ) {}

  /**
   * POST /api/auth/merchant/login
   * Merchant sign in with email and password
   */
  async login(
    request: FastifyRequest<{ Body: SignInRequest }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = SignInSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0]?.message || 'Invalid request',
          },
        });
      }

      // Call auth service
      const response = await this.authService.signIn(validationResult.data);

      if (!response.success) {
        return reply.status(401).send(response);
      }

      return reply.status(200).send(response);
    } catch (error) {
      this.server.log.error(error, 'Login handler failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Authentication failed',
        },
      });
    }
  }

  /**
   * POST /api/auth/merchant/register
   * Register new merchant account
   */
  async register(
    request: FastifyRequest<{ Body: SignUpRequest }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = SignUpSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0]?.message || 'Invalid request',
          },
        });
      }

      // Call auth service
      const response = await this.authService.signUp(validationResult.data);

      if (!response.success) {
        const statusCode = response.error?.code === 'USER_EXISTS' ? 409 : 400;
        return reply.status(statusCode).send(response);
      }

      return reply.status(201).send(response);
    } catch (error) {
      this.server.log.error(error, 'Registration handler failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create account',
        },
      });
    }
  }

  /**
   * POST /api/auth/merchant/verify-otp
   * Verify OTP code
   */
  async verifyOTP(
    request: FastifyRequest<{ Body: VerifyOTPRequest }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = VerifyOTPSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0]?.message || 'Invalid request',
          },
        });
      }

      // Call auth service
      const response = await this.authService.verifyOTP(validationResult.data);

      if (!response.success) {
        const statusCode = response.error?.code === 'INVALID_OTP' ? 400 : 401;
        return reply.status(statusCode).send(response);
      }

      return reply.status(200).send(response);
    } catch (error) {
      this.server.log.error(error, 'OTP verification handler failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify code',
        },
      });
    }
  }

  /**
   * POST /api/auth/merchant/resend-otp
   * Resend OTP code
   */
  async resendOTP(
    request: FastifyRequest<{ Body: ResendOTPRequest }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = ResendOTPSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0]?.message || 'Invalid request',
          },
        });
      }

      // Call auth service
      const response = await this.authService.resendOTP(validationResult.data);

      if (!response.success) {
        const statusCode = response.error?.code === 'RATE_LIMIT_EXCEEDED' ? 429 : 400;
        return reply.status(statusCode).send(response);
      }

      return reply.status(200).send(response);
    } catch (error) {
      this.server.log.error(error, 'Resend OTP handler failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to resend code',
        },
      });
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Request password reset
   */
  async forgotPassword(
    request: FastifyRequest<{ Body: RequestPasswordResetRequest }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = RequestPasswordResetSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0]?.message || 'Invalid request',
          },
        });
      }

      // Call auth service
      const response = await this.authService.requestPasswordReset(validationResult.data);

      if (!response.success) {
        return reply.status(400).send(response);
      }

      return reply.status(200).send(response);
    } catch (error) {
      this.server.log.error(error, 'Password reset request handler failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process request',
        },
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Reset password with token
   */
  async resetPassword(
    request: FastifyRequest<{ Body: ResetPasswordRequest }>,
    reply: FastifyReply
  ) {
    try {
      // Validate request body
      const validationResult = ResetPasswordSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0]?.message || 'Invalid request',
          },
        });
      }

      // Call auth service
      const response = await this.authService.resetPassword(validationResult.data);

      if (!response.success) {
        const statusCode = response.error?.code === 'INVALID_TOKEN' ? 400 : 401;
        return reply.status(statusCode).send(response);
      }

      return reply.status(200).send(response);
    } catch (error) {
      this.server.log.error(error, 'Password reset handler failed');
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to reset password',
        },
      });
    }
  }
}
