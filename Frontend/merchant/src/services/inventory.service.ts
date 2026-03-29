import { api } from '@/lib/api-client';
import {
    InventoryLocation,
    InventoryItem,
    InventoryMovement,
    StockAdjustmentResult
} from "@/types/inventory";

export class InventoryService {
    static async getDefaultLocation(storeId: string): Promise<InventoryLocation> {
        const response = await api.get(`/inventory/${storeId}/default-location`);
        return response.data || {};
    }
    
    static async adjustStock(
        storeId: string,
        variantId: string,
        productId: string,
        quantityChange: number,
        reason: string,
        actorId: string,
        locationId?: string
    ): Promise<StockAdjustmentResult> {
        const response = await api.post('/inventory/adjust', {
            storeId,
            variantId,
            productId,
            quantityChange,
            reason,
            actorId,
            locationId,
        });
        return response.data || {};
    }
    
    static async getHistory(storeId: string, variantId: string): Promise<InventoryMovement[]> {
        const response = await api.get('/inventory/history', {
            storeId,
            variantId,
        });
        return response.data || [];
    }
}
