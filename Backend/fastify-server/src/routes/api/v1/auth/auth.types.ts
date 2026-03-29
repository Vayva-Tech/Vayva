/**
 * Authentication Types
 * TypeScript type definitions for merchant authentication
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'owner' | 'admin' | 'staff';
  emailVerified: boolean;
  phone?: string;
  phoneVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Merchant {
  id: string;
  userId: string;
  storeName: string;
  industrySlug?: string;
  onboardingCompleted: boolean;
  subscriptionTier: 'FREE' | 'PRO' | 'PRO_PLUS';
  createdAt: Date;
  updatedAt: Date;
}

export interface OTPCode {
  id: string;
  email: string;
  code: string;
  method: 'EMAIL' | 'WHATSAPP';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// Request/Response Types
export interface SignInRequest {
  email: string;
  password: string;
  otpMethod?: 'EMAIL' | 'WHATSAPP';
}

export interface SignInResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
    merchant?: Merchant | null;
    requiresOTP: boolean;
    otpMethod?: 'EMAIL' | 'WHATSAPP';
    maskedPhone?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  storeName: string;
  industrySlug?: string;
  otpMethod?: 'EMAIL' | 'WHATSAPP';
}

export interface SignUpResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
    requiresVerification: boolean;
    otpMethod?: 'EMAIL' | 'WHATSAPP';
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
  method: 'EMAIL' | 'WHATSAPP';
  rememberMe?: boolean;
}

export interface VerifyOTPResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
    merchant?: Merchant | null;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ResendOTPRequest {
  email: string;
  method: 'EMAIL' | 'WHATSAPP';
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  storeId?: string;
  tier?: string;
}
