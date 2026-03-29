/**
 * Authentication Service
 * Handles merchant authentication, password reset, and OTP verification
 * All operations delegate to Fastify backend - NO direct database access
 */

import type {
  SignInResponse,
  SignUpResponse,
  VerifyOTPResponse,
  PasswordResetResponse,
  ResendCodeResponse,
  SignInInput,
  SignUpInput,
  ResendCodeInput,
  PasswordResetInput,
  RequestPasswordResetInput,
} from "@/types/auth";

// Backend API base URL configuration
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || "";

export class AuthService {
  /**
   * Request password reset email
   * Delegates to backend which handles:
   * - Token generation
   * - Email sending via Resend
   * - Token storage and expiration
   */
  static async requestPasswordReset(
    email: string,
  ): Promise<PasswordResetResponse> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({
        error: { message: "Failed to request password reset" },
      }));
      const errorMessage =
        errorData.error?.message ||
        errorData.message ||
        errorData.error ||
        `Failed to request password reset: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // Alias for backward compatibility
  static async forgotPassword(
    data: RequestPasswordResetInput,
  ): Promise<PasswordResetResponse> {
    return AuthService.requestPasswordReset(data.email);
  }

  /**
   * Verify password reset token and set new password
   * Delegates to backend which handles:
   * - Token validation and expiration check
   * - Password hashing with bcrypt
   * - Token invalidation after use
   */
  static async verifyPasswordReset(
    token: string,
    password: string,
  ): Promise<PasswordResetResponse> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: { message: "Failed to reset password" } }));
      const errorMessage =
        errorData.error?.message ||
        errorData.message ||
        errorData.error ||
        `Failed to reset password: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // Alias for backward compatibility
  static async resetPassword(
    data: PasswordResetInput,
  ): Promise<PasswordResetResponse> {
    return AuthService.verifyPasswordReset(data.token, data.password);
  }

  /**
   * Sign in with email and password
   * Delegates to backend which handles:
   * - User lookup and password verification with bcrypt
   * - JWT token generation
   * - OTP generation and email sending (if required)
   */
  static async signIn(
    email: string,
    password: string,
    otpMethod?: "EMAIL" | "WHATSAPP",
  ): Promise<SignInResponse> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/merchant/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, otpMethod }),
    });
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: { message: "Invalid credentials" } }));
      const errorMessage =
        errorData.error?.message ||
        errorData.message ||
        errorData.error ||
        `Failed to sign in: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // Alias for backward compatibility
  static async login(data: SignInInput): Promise<SignInResponse> {
    return AuthService.signIn(data.email, data.password, data.otpMethod);
  }

  /**
   * Register new merchant account
   * Delegates to backend which handles:
   * - Duplicate email check
   * - User creation with bcrypt password hashing
   * - Merchant/store creation
   * - OTP generation and email sending via Resend
   */
  static async signUp(data: SignUpInput): Promise<SignUpResponse> {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/merchant/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ error: { message: "Failed to create account" } }));
      const errorMessage =
        errorData.error?.message ||
        errorData.message ||
        errorData.error ||
        `Failed to sign up: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }

// Alias for backward compatibility
static async register(
  data: SignUpInput,
): Promise<SignUpResponse> {
  return AuthService.signUp(data);
}
