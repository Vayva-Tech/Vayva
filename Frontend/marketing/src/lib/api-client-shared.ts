// API client shared utilities
// Stub for marketing/storefront apps

export async function apiFetch<T>(url: string, options?: Parameters<typeof fetch>[1]): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function apiJson<T>(url: string, options?: Parameters<typeof fetch>[1]): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
}

export function createApiClient(baseURL: string) {
  return {
    get: <T>(path: string) => apiFetch<T>(`${baseURL}${path}`),
    post: <T>(path: string, data: unknown) => apiJson<T>(`${baseURL}${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    put: <T>(path: string, data: unknown) => apiJson<T>(`${baseURL}${path}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: <T>(path: string) => apiFetch<T>(`${baseURL}${path}`, { method: 'DELETE' }),
  };
}
