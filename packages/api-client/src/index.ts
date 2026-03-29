/* eslint-disable no-undef */
/// <reference lib="dom" />

import {
  AuthMeResponse,
  ApiResponse,
  LoginRequest,
  AuthResponseData,
  InviteStaffRequest,
  AcceptInviteRequest,
} from "@vayva/shared";

// Point to Fastify backend - all API calls go through Fastify
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

class ApiClient {
  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${path}`;

    options.credentials = "include";
    options.headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const controller = new AbortController();
    const timeoutMs = 10_000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData: ApiResponse<T> = await response.json().catch(() => ({
          success: false,
          error: { code: "UNKNOWN_ERROR", message: "Unknown error" },
        }));

        return errorData;
      }

      return response.json();
    } catch (error) {
      const isAbort =
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name?: string }).name === "AbortError";
      return {
        success: false,
        error: {
          code: isAbort ? "TIMEOUT" : "NETWORK_ERROR",
          message: isAbort ? "Request timed out" : "Network error",
        },
      } as ApiResponse<T>;
    } finally {
      clearTimeout(timeout);
    }
  }

  async get<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(
    path: string,
    data?: unknown,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    path: string,
    data?: unknown,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    path: string,
    data?: unknown,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  // Auth
  auth = {
    login: (data: LoginRequest) =>
      this.request<AuthResponseData>("/auth/merchant/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    register: (data: unknown) =>
      this.request<AuthResponseData>("/auth/merchant/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    verifyOtp: (data: { email: string; otp: string }) =>
      this.request<{ success: boolean }>("/auth/merchant/verify-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resendOtp: (data: { email: string }) =>
      this.request<{ success: boolean }>("/auth/merchant/resend-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    forgotPassword: (data: { email: string }) =>
      this.request<{ success: boolean }>("/auth/merchant/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resetPassword: (data: { token: string; password?: string }) =>
      this.request<{ success: boolean }>("/auth/merchant/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: () =>
      this.request<{ success: boolean }>("/auth/merchant/logout", {
        method: "POST",
      }),
    me: () => this.request<AuthMeResponse>("/auth/merchant/me"),
  };

  // Onboarding
  onboarding = {
    getState: () => this.request<unknown>("/onboarding/state"),
    updateState: (data: Record<string, unknown>) =>
      this.request<unknown>("/onboarding/state", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  };

  // Staff
  staff = {
    list: () => this.request<unknown[]>("/staff"),
    getInvites: () => this.request<unknown[]>("/staff/invites"),
    invite: (data: InviteStaffRequest) =>
      this.request<{ id: string }>("/staff/invite", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    acceptInvite: (data: AcceptInviteRequest) =>
      this.request<{ success: boolean }>("/staff/invites/accept", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    remove: (id: string) =>
      this.request<{ success: boolean }>(`/staff/${id}`, { method: "DELETE" }),
  };
}

export const apiClient = new ApiClient();
export type * from "./generated/schema";
