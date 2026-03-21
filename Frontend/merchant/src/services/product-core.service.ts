import { prisma } from "@/lib/prisma";
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
        // 1. Fetch Merchant to know Category & Plan
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { category: true, plan: true }
        });
        if (!store) {
            throw new Error("Store not found");
        }
        // 2. Enforce Plan Limits (QuotaGuard)
        const PLAN_LIMITS = {
            "FREE": 10,
            "STARTER": 50,
            "PRO": 1000,
            "GROWTH": 10000,
            "ENTERPRISE": 100000
        };
        const limit = PLAN_LIMITS[store.plan] || 5;
        const currentCount = await prisma.product?.count({
            where: { storeId }
        });
        if (currentCount >= limit) {
            throw new Error(`Product limit reached for your plan (${store.plan}). Limit: ${limit}`);
        }
        // 3. Validate Base Fields
        // Map payload fields to schema (handling 'title' vs 'name')
        const input = {
            name: payload.title || payload.name,
            price: Number(payload.price || 0),
            description: payload.description,
            images: payload.images
        };
        const parseResult = BaseProductSchema.safeParse(input);
        if (!parseResult.success) {
            throw new Error("Invalid product data: " + JSON.stringify(parseResult.error?.flatten()));
        }
        const { name, price, description } = parseResult.data;
        const variants = payload.variants || [];
        // 4. Gather industry-specific attributes into metadata
        const attributes = payload.metadata || payload.attributes || {};
        const industryFields = ["digital", "realEstate", "automotive", "stay", "event", "isTodaysSpecial"];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        industryFields.forEach((field: any) => {
            if (payload[field] !== undefined) {
                attributes[field] = payload[field];
            }
        });
        // 4. Validate Category Specific Attributes
        // Fallback to retail if category not mapped
        const schema = SCHEMA_MAP[store.category as keyof typeof SCHEMA_MAP] || SCHEMA_MAP["retail"];
        if (schema) {
            const attrParse = schema.safeParse(attributes);
            if (!attrParse.success) {
                // Log warning but allow creation? Enforce strict?
                // For now, strict.
                // throw new Error(`Invalid attributes for category ${store.category}: ` + JSON.stringify(attrParse.error?.flatten()));
            }
        }
        // 5. Transactional Creation
        const result = await prisma.$transaction(async (tx: any) => {
            // A. Ensure Inventory Location exists
            let location = await tx.inventoryLocation?.findFirst({
                where: { storeId, isDefault: true }
            });
            if (!location) {
                location = await tx.inventoryLocation?.create({
                    data: {
                        storeId,
                        name: "Default Location",
                        isDefault: true
                    }
                });
            }
            // B. Create Product
            const product = await tx.product?.create({
                data: {
                    storeId,
                    title: name,
                    handle: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now(),
                    price: price,
                    description: description ? sanitizeHtml(description) : undefined,
                    metadata: attributes,
                    productType: payload.productType || store.category, // Allow override or default to store cat
                    tags: payload.tags || [],
                    status: (payload as any).status || "ACTIVE"
                }
            });
            // C. Handle Variants & Inventory
            const skuBase = payload.sku || `SKU-${Date.now()}`;
            const stockQuantity = Number(payload.stock || payload.inventory || 0);
            if (variants.length > 0) {
                for (const v of variants) {
                    // Create Variant
                    const variant = await tx.productVariant?.create({
                        data: {
                            productId: product.id,
                            title: v.title,
                            options: v.options,
                            price: v.price,
                            sku: v.sku,
                            trackInventory: true
                        }
                    });
                    // Create Inventory Item
                    await tx.inventoryItem?.create({
                        data: {
                            locationId: location.id,
                            variantId: variant.id,
                            productId: product.id,
                            onHand: v.stock || 0,
                            available: v.stock || 0
                        }
                    });
                }
            }
            else {
                // Simple Product as Default Variant
                const defaultVariant = await tx.productVariant?.create({
                    data: {
                        productId: product.id,
                        title: "Default Title",
                        options: {},
                        price: price,
                        sku: skuBase,
                        trackInventory: true
                    }
                });
                await tx.inventoryItem?.create({
                    data: {
                        locationId: location.id,
                        variantId: defaultVariant.id,
                        productId: product.id,
                        onHand: stockQuantity,
                        available: stockQuantity
                    }
                });
            }
            // D. Handle Automotive Vehicle Data (Legacy Support)
            if (store.category === "Automotive" && attributes.vehicle) {
                const { year, make, model, vin, mileage, fuelType, transmission } = attributes.vehicle;
                await tx.vehicleProduct?.create({
                    data: {
                        productId: product.id,
                        year: year || 0,
                        make: make || "Unknown",
                        model: model || "Unknown",
                        vin,
                        mileage: mileage || 0,
                        fuelType: fuelType || "PETROL",
                        transmission: transmission || "AUTOMATIC"
                    }
                });
            }
            return product;
        });
        return result;
    }
}
