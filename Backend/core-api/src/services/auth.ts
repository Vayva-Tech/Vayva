import { apiClient } from "@vayva/api-client";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponseData,
  AuthMeResponse,
} from "@vayva/shared";

interface OtpAugmentedError extends Error {
  otp?: unknown;
  emailDelivery?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<AuthResponseData> => {
    try {
      const response = await apiClient.auth.login(credentials);
      // Handle error response format
      if (response.error) {
        const errorMessage =
          typeof response.error === "string"
            ? response.error
            : response.error.message || "Login failed";
        const err = new Error(errorMessage);
        if (errorMessage === "OTP_REQUIRED") {
          const otpErr: OtpAugmentedError = err;
          if (isRecord(response)) {
            otpErr.otp = response.otp;
            otpErr.emailDelivery = response.emailDelivery;
          }
        }
        throw err;
      }
      // Handle success response - could be response.data or direct response
      if (response.success === false) {
        throw new Error("Login failed");
      }
      // If response has data property, use it; otherwise response itself is the data
      if (response.data) {
        return response.data;
      }
      // Response is already in AuthResponseData format (user, merchant properties)
      return response as unknown as AuthResponseData;
    } catch (error: unknown) {
      // NO TEST FALLBACK - Fail cleanly if backend unavailable
      if (error instanceof Error && error.message === "Request failed") {
        throw new Error(
          "Authentication service unavailable. Please try again later.",
        );
      }
      throw error;
    }
  },
  getProfile: async (): Promise<AuthMeResponse> => {
    const response = await apiClient.auth.me();
    if (!response.success && response.error) {
      throw new Error(response.error.message);
    }
    return response.data!;
  },
  register: async (payload: RegisterRequest): Promise<AuthResponseData> => {
    try {
      const response = await apiClient.auth.register(payload);
      if (!response.success && response.error) {
        throw new Error(response.error.message);
      }
      return response.data!;
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "Request failed") {
        throw new Error(
          "Registration service unavailable. Please try again later.",
        );
      }
      throw error;
    }
  },
  verify: async (payload: { email: string; otp: string }): Promise<boolean> => {
    const response = await apiClient.auth.verifyOtp(payload);
    return response.success;
  },
  resendCode: async (payload: { email: string }): Promise<boolean> => {
    const response = await apiClient.auth.resendOtp(payload);
    return response.success;
  },
  forgotPassword: async (payload: { email: string }): Promise<boolean> => {
    const response = await apiClient.auth.forgotPassword(payload);
    return response.success;
  },
  resetPassword: async (payload: {
    token: string;
    password?: string;
  }): Promise<boolean> => {
    const response = await apiClient.auth.resetPassword(payload);
    return response.success;
  },
  logout: async (): Promise<boolean> => {
    const response = await apiClient.auth.logout();
    return response.success;
  },
};
