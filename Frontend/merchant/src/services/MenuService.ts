import { api } from '@/lib/api-client';

interface MenuItemData {
    name: string;
    description?: string;
    price: number;
    metadata?: Record<string, unknown>;
    categoryId?: string;
}

export const MenuService = {
    async createMenuItem(storeId: string, data: MenuItemData) {
        const response = await api.post('/menu-items', {
            storeId,
            name: data.name,
            description: data.description,
            price: data.price,
            productType: "MENU_ITEM",
            metadata: data.metadata,
        });
        return response.data;
    },
    
    async getKitchenOrders(storeId: string) {
        const response = await api.get('/kitchen/orders', {
            storeId,
            fulfillmentStatus: 'UNFULFILLED,PREPARING',
            paymentStatus: 'SUCCESS,VERIFIED',
        });
        return response.data || [];
    },
    
    async updateOrderStatus(orderId: string, status: string) {
        const response = await api.patch(`/kitchen/orders/${orderId}/status`, {
            status,
        });
        return response.data;
    }
};
