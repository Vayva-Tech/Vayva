// Auth utilities for marketing/storefront apps
// Stub implementation

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export function useAuth() {
  return {
    user: null as AuthUser | null,
    isLoading: false,
    isAuthenticated: false,
    login: async () => {},
    logout: async () => {},
  };
}

export function getAuthToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

export function withAuth(fn: (req: unknown) => unknown) {
  return fn;
}
