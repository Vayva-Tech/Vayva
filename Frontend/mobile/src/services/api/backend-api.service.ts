/**
 * Backend API Integration Service
 * 
 * Connects mobile apps to Vayva backend APIs:
 * - Authentication & Authorization
 * - Industry-specific API endpoints
 * - Real-time data synchronization
 * - Error handling & retry logic
 */

import { offlineSyncService } from '../offline-sync.service';

export interface APIConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

class BackendAPIService {
  private static instance: BackendAPIService;
  private config: APIConfig;
  private authToken: AuthToken | null = null;
  private industry: string = 'retail'; // Default industry

  private constructor() {
    this.config = {
      baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      retries: 3,
    };
  }

  static getInstance(): BackendAPIService {
    if (!BackendAPIService.instance) {
      BackendAPIService.instance = new BackendAPIService();
    }
    return BackendAPIService.instance;
  }

  /**
   * Set industry context for API calls
   */
  setIndustry(industry: string): void {
    this.industry = industry;
  }

  /**
   * Authenticate user
   */
  async authenticate(email: string, password: string): Promise<AuthToken> {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      this.authToken = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };

      return this.authToken;
    } catch (error) {
      console.error('[API] Authentication error:', error);
      throw error;
    }
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    // Refresh token if expired
    if (Date.now() >= this.authToken.expiresAt) {
      await this.refreshToken();
    }

    return {
      'Authorization': `Bearer ${this.authToken.accessToken}`,
      'Content-Type': 'application/json',
      'X-Industry': this.industry,
    };
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<void> {
    if (!this.authToken) return;

    try {
      const response = await fetch(`${this.config.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.authToken.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      this.authToken = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || this.authToken.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };
    } catch (error) {
      console.error('[API] Token refresh error:', error);
      this.authToken = null;
      throw error;
    }
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<APIResponse<T>> {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return this.request<T>('GET', url.toString());
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, data: unknown): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    return this.request<T>('POST', url, data);
  }

  /**
   * Generic PUT request
   */
  async put<T>(endpoint: string, data: unknown): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    return this.request<T>('PUT', url, data);
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    return this.request<T>('DELETE', url);
  }

  /**
   * Generic request with retry logic
   */
  private async request<T>(
    method: string,
    url: string,
    body?: unknown
  ): Promise<APIResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method,
          headers: await this.getAuthHeaders(),
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        return {
          data,
          status: response.status,
          headers: response.headers,
        };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error("Request failed");
        
        // Don't retry on auth errors
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error as { status?: unknown }).status === 401
        ) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.config.retries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  /**
   * Queue request for offline sync
   */
  async queueRequest(
    type: 'create' | 'update' | 'delete',
    entity: string,
    data: unknown
  ): Promise<string> {
    return offlineSyncService.queueAction({
      type,
      entity,
      data,
    });
  }

  /**
   * Industry-specific API methods
   */

  // Healthcare APIs
  async getPatients() {
    return this.get<unknown[]>('/healthcare/patients');
  }

  async getAppointments(date?: string) {
    return this.get<unknown[]>('/healthcare/appointments', { date });
  }

  async getClinicalNotes(patientId: string) {
    return this.get<unknown[]>(`/healthcare/patients/${patientId}/notes`);
  }

  // Retail APIs
  async getProducts() {
    return this.get<unknown[]>('/retail/products');
  }

  async getInventory() {
    return this.get<unknown[]>('/retail/inventory');
  }

  async processOrder(orderData: unknown) {
    return this.post<unknown>('/retail/orders', orderData);
  }

  // Restaurant APIs
  async getTables() {
    return this.get<unknown[]>('/restaurant/tables');
  }

  async getReservations(date?: string) {
    return this.get<unknown[]>('/restaurant/reservations', { date });
  }

  async createOrder(orderData: unknown) {
    return this.post<unknown>('/restaurant/orders', orderData);
  }

  // Legal APIs
  async getMatters() {
    return this.get<unknown[]>('/legal/matters');
  }

  async getDocuments(matterId: string) {
    return this.get<unknown[]>(`/legal/matters/${matterId}/documents`);
  }

  // Food APIs
  async getIngredients() {
    return this.get<unknown[]>('/food/ingredients');
  }

  async getRecipes() {
    return this.get<unknown[]>('/food/recipes');
  }

  async updateInventory(itemId: string, quantity: number) {
    return this.put<unknown>(`/food/inventory/${itemId}`, { quantity });
  }
}

// Export singleton instance
export const backendAPIService = BackendAPIService.getInstance();
