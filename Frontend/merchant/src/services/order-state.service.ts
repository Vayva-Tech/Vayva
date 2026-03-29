import { api } from '@/lib/api-client';

export class OrderStateService {
    /**
     * Transition order fulfillment status (calls backend API)
     */
    static async transition(orderId: string, toStatus: string) {
        const result = await api.post('/api/v1/orders/state/transition', { orderId, toStatus });
        return result;
    }

    /**
     * Get current order status (calls backend API)
     */
    static async getStatus(orderId: string) {
        const result = await api.get('/api/v1/orders/state/status', { orderId });
        return result;
    }

    /**
     * Bulk update order statuses (calls backend API)
     */
    static async bulkUpdate(orderIds: string[], toStatus: string) {
        const result = await api.post('/api/v1/orders/state/bulk-update', { orderIds, toStatus });
        return result;
    }
}
