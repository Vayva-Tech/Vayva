/**
 * Auth Schema Tests
 * Tests for authentication-related Zod schemas
 */

import { describe, it, expect } from 'vitest';
import {
  SignupRequestSchema,
  LoginRequestSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
  type SignupRequest,
  type LoginRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from '../auth';

describe('Auth Schemas', () => {
  describe('SignupRequestSchema', () => {
    it('should validate valid signup request', () => {
      const validData: SignupRequest = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = SignupRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = SignupRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = SignupRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty first name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '',
        lastName: 'Doe',
      };

      const result = SignupRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty last name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: '',
      };

      const result = SignupRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = SignupRequestSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('LoginRequestSchema', () => {
    it('should validate valid login request', () => {
      const validData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept empty password (for validation only)', () => {
      const data = {
        email: 'test@example.com',
        password: '',
      };

      const result = LoginRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const incompleteData = {
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('ForgotPasswordRequestSchema', () => {
    it('should validate valid forgot password request', () => {
      const validData: ForgotPasswordRequest = {
        email: 'test@example.com',
      };

      const result = ForgotPasswordRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = ForgotPasswordRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('ResetPasswordRequestSchema', () => {
    it('should validate valid reset password request', () => {
      const validData: ResetPasswordRequest = {
        token: 'reset-token-123',
        newPassword: 'newpassword123',
      };

      const result = ResetPasswordRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const invalidData = {
        token: 'reset-token-123',
        newPassword: 'short',
      };

      const result = ResetPasswordRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing token', () => {
      const incompleteData = {
        newPassword: 'newpassword123',
      };

      const result = ResetPasswordRequestSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });
});
