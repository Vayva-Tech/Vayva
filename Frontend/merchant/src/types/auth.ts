/**
 * Authentication Types
 * Type definitions for authentication service responses
 */

import type { UserProfile } from "./account";

// ============================================================================
// User Types
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  emailVerified?: Date | null;
  phoneVerified?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Merchant Types
// ============================================================================

export interface AuthMerchant {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  logoUrl?: string | null;
  isPublished: boolean;
  status: "active" | "inactive" | "suspended" | "pending";
  storeUrl?: string | null;
  settings?: {
    currency: string;
    timezone: string;
    language: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Authentication Response Types
// ============================================================================

export interface SignInResponse {
  success: boolean;
  requiresOTP?: boolean;
  user?: AuthUser;
  merchant?: AuthMerchant;
  otpMethod?: "EMAIL" | "WHATSAPP";
  maskedPhone?: string;
  message?: string;
}

export interface SignUpResponse {
  success: boolean;
  requiresOTP?: boolean;
  message?: string;
  user?: AuthUser;
  merchant?: AuthMerchant;
}

export interface VerifyOTPResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  merchant?: AuthMerchant;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
}

export interface ResendCodeResponse {
  success: boolean;
  message?: string;
}

// ============================================================================
// Sign In/Up Input Types
// ============================================================================

export interface SignInInput {
  email: string;
  password: string;
  otpMethod?: "EMAIL" | "WHATSAPP";
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string; // Optional business name for store creation
  plan?: "starter" | "pro" | "pro_plus"; // Plan selection for database persistence
}

export interface VerifyOTPInput {
  email: string;
  code: string;
  method?: "EMAIL" | "WHATSAPP";
}

export interface PasswordResetInput {
  token: string;
  password: string;
}

export interface RequestPasswordResetInput {
  email: string;
}

export interface ResendCodeInput {
  email: string;
  method?: "EMAIL" | "WHATSAPP";
}
