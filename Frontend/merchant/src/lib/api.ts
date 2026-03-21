/**
 * API client utilities for making HTTP requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function apiJson<T>(
  url: string,
  options?: Parameters<typeof fetch>[1]
): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function apiPost<T>(
  url: string,
  data: unknown,
  options?: Parameters<typeof fetch>[1]
): Promise<T> {
  return apiJson<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
}

export async function apiPut<T>(
  url: string,
  data: unknown,
  options?: Parameters<typeof fetch>[1]
): Promise<T> {
  return apiJson<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
}

export async function apiDelete<T>(
  url: string,
  options?: Parameters<typeof fetch>[1]
): Promise<T> {
  return apiJson<T>(url, {
    method: "DELETE",
    ...options,
  });
}
