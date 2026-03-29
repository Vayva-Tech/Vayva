import { api } from '@/lib/api-client';

export class DeletionService {
    /**
     * Request account deletion (calls backend API)
     */
    static async requestDeletion(reason?: string) {
        const result = await api.post('/api/v1/compliance/account-deletion/request', { reason });
        return result;
    }

    /**
     * Cancel pending deletion request (calls backend API)
     */
    static async cancelDeletion() {
        const result = await api.post('/api/v1/compliance/account-deletion/cancel');
        return result;
    }

    /**
     * Get current deletion status (calls backend API)
     */
    static async getStatus() {
        const result = await api.get('/api/v1/compliance/account-deletion/status');
        return result;
    }

    /**
     * Execute deletion - BACKEND ONLY (removed from frontend)
     * This should only be called by background jobs
     */
    // static async executeDeletion(requestId: string) {
    //     throw new Error('executeDeletion is backend-only operation');
    // }

    /**
     * Invalidate sessions - BACKEND ONLY (removed from frontend)
     * This is handled automatically by backend during deletion
     */
    // static async invalidateStoreSessions(storeId: string) {
    //     throw new Error('invalidateStoreSessions is backend-only operation');
    // }

    /**
     * Check blockers - DEPRECATED (handled by backend)
     * Blockers are now checked server-side during deletion request
     */
    // static async checkBlockers(storeId: string) {
    //     console.warn('checkBlockers is deprecated - blockers are checked server-side');
    //     return [];
    // }
}
