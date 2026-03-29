import { api } from '@/lib/api-client';
import { z } from "zod";
import { sanitizeHtml } from "@/lib/security/sanitize";
import { SCHEMA_MAP } from "@/lib/product-schemas";
// Validation Schemas
const BaseProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.number().min(0),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
});
export class ProductCoreService {
    /**
     * Create a product with full business logic (Quotas, Inventory, Variants)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async createProduct(storeId: string, payload: any) {
        const response = await api.post('/products', {
            storeId,
            ...payload,
        });
        return response.data || {};
    }
}
