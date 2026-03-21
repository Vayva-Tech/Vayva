/**
 * Authentication Service
 * Handles merchant authentication, password reset, and OTP verification
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

export class AuthService {
  /**
   * Request password reset email
   */
  static async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: "Failed to request password reset" } }));
      const errorMessage = errorData.error?.message || errorData.message || errorData.error || `Failed to request password reset: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // Alias for backward compatibility
  static async forgotPassword(data: RequestPasswordResetInput): Promise<PasswordResetResponse> {
    return AuthService.requestPasswordReset(data.email);
  }

  /**
   * Verify password reset token and set new password
   */
  static async verifyPasswordReset(
    token: string,
    password: string
  ): Promise<PasswordResetResponse> {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: "Failed to reset password" } }));
      const errorMessage = errorData.error?.message || errorData.message || errorData.error || `Failed to reset password: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // Alias for backward compatibility
  static async resetPassword(data: PasswordResetInput): Promise<PasswordResetResponse> {
    return AuthService.verifyPasswordReset(data.token, data.password);
  }

  /**
   * Sign in with email and password
   */
  static async signIn(
    email: string,
    password: string,
    otpMethod?: "EMAIL" | "WHATSAPP"
  ): Promise<SignInResponse> {
    const res = await fetch("/api/auth/merchant/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, otpMethod }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: "Invalid credentials" } }));
      const errorMessage = errorData.error?.message || errorData.message || errorData.error || `Failed to sign in: ${res.statusText}`;
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
   */
  static async signUp(data: SignUpInput): Promise<SignUpResponse> {
    const res = await fetch("/api/auth/merchant/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: "Failed to create account" } }));
      const errorMessage = errorData.error?.message || errorData.message || errorData.error || `Failed to sign up: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // Alias for backward compatibility
  static async register(data: Omit<SignUpInput, "storeName"> & { storeName?: string }): Promise<SignUpResponse> {
    return AuthService.signUp({ ...data, storeName: data.storeName || "" });
  }

  /**
   * Verify OTP code
   */
  static async verifyOTP(
    email: string,
    code: string,
    method?: "EMAIL" | "WHATSAPP"
  ): Promise<VerifyOTPResponse> {
    const res = await fetch("/api/auth/merchant/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, method: method || "EMAIL" }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: "Invalid verification code" } }));
      const errorMessage = errorData.error?.message || errorData.message || errorData.error || `Failed to verify OTP: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // Alias for backward compatibility
  static async resendCode(data: ResendCodeInput): Promise<ResendCodeResponse> {
    const res = await fetch("/api/auth/merchant/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: "Failed to resend code" } }));
      const errorMessage = errorData.error?.message || errorData.message || errorData.error || `Failed to resend code: ${res.statusText}`;
      throw new Error(errorMessage);
    }
    return res.json();
  }
}

// Keep individual exports for backward compatibility
export async function requestPasswordReset(email: string): Promise<{ success: boolean }> {
  return AuthService.requestPasswordReset(email);
}

export async function verifyPasswordReset(
  token: string,
  password: string
): Promise<{ success: boolean }> {
  return AuthService.verifyPasswordReset(token, password);
}

export async function signIn(
  email: string,
  password: string,
  otpMethod?: "EMAIL" | "WHATSAPP"
): Promise<SignInResponse> {
  return AuthService.signIn(email, password, otpMethod);
}

export async function signUp(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  storeName: string;
}): Promise<{ success: boolean }> {
  return AuthService.signUp(data);
}

export async function verifyOTP(
  email: string,
  code: string,
  method?: "EMAIL" | "WHATSAPP"
): Promise<{ success: boolean }> {
  return AuthService.verifyOTP(email, code, method);
}
