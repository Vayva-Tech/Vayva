import { logger } from "@vayva/shared";

const BACKEND_URL = process.env.BACKEND_API_URL || '';

export interface CreateReturnRequestPayload {
  customerId?: string;
  reason?: string;
  [key: string]: unknown;
}

export class ReturnService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async createRequest(storeId: string, orderId: any, customerPhone: any, payload: CreateReturnRequestPayload) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/returns/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, customerPhone, payload }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to create return request' } }));
        logger.error('[ReturnService] Failed to create return request', error);
        throw new Error(error.error?.message || 'Failed to create return request');
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      logger.error('[ReturnService] Error creating return request', error);
      throw error;
    }
  }

  static async getRequests(storeId: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/returns/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch return requests');
      }

      const data = await res.json();
      return data.data || [];
    } catch (error) {
      logger.error('[ReturnService] Error fetching return requests', error);
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async updateStatus(requestId: any, status: any, actorId: any, data?: unknown) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/returns/request/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, notes: (data as any)?.notes }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to update return status' } }));
        logger.error('[ReturnService] Failed to update return status', error);
        throw new Error(error.error?.message || 'Failed to update return status');
      }

      return true;
    } catch (error) {
      logger.error('[ReturnService] Error updating return status', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getRequestById(requestId: any) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/returns/request/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch return request');
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      logger.error('[ReturnService] Error fetching return request', error);
      return null;
    }
  }

  static async cancelRequest(requestId: string, reason?: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/returns/request/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to cancel return request' } }));
        logger.error('[ReturnService] Failed to cancel return request', error);
        throw new Error(error.error?.message || 'Failed to cancel return request');
      }

      return true;
    } catch (error) {
      logger.error('[ReturnService] Error canceling return request', error);
      throw error;
    }
  }

  static async approveRequest(requestId: string, notes?: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/returns/request/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to approve return request' } }));
        logger.error('[ReturnService] Failed to approve return request', error);
        throw new Error(error.error?.message || 'Failed to approve return request');
      }

      return true;
    } catch (error) {
      logger.error('[ReturnService] Error approving return request', error);
      throw error;
    }
  }

  static async completeRequest(requestId: string, notes?: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/returns/request/${requestId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to complete return request' } }));
        logger.error('[ReturnService] Failed to complete return request', error);
        throw new Error(error.error?.message || 'Failed to complete return request');
      }

      return true;
    } catch (error) {
      logger.error('[ReturnService] Error completing return request', error);
      throw error;
    }
  }

  static async getReturnStats(storeId: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/returns/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch return stats');
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      logger.error('[ReturnService] Error fetching return stats', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0,
        cancelled: 0,
      };
    }
  }
}

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch {
    return null;
  }
}
