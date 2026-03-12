
import { prisma, Prisma } from "@vayva/db";

// Define return types that include relations
const cartInclude = {
    items: {
        include: {
            variant: {
                include: {
                    productImage: true,
                    product: {
                        include: {
                            productImages: true,
                            store: {
                                include: {
                                    deliverySettings: true
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export type CartWithRelations = Prisma.CartGetPayload<{
    include: typeof cartInclude
}>;

export interface SplitCartGroup {
    storeId: string;
    storeName: string;
    items: CartWithRelations['items'];
    subtotal: number;
    deliveryFee: number;
    deliveryFeeType: string; // 'FLAT' | 'DISTANCE'
    canDeliver: boolean;
}

export interface EnrichedCart {
    id: string;
    userId: string | null;
    items: CartWithRelations['items'];
    cartTotal: number;
    payableAmount: number;
    groups: SplitCartGroup[];
}

export class CartService {

    static async getCart(cartId: string): Promise<EnrichedCart | null> {
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: cartInclude.items.include ? cartInclude : undefined,
        });

        if (!cart) return null;

        // Use strict interface to satisfy both logic and linter
        const typedCart = cart as CartWithRelations;

        // Group items by store
        const groups: Record<string, SplitCartGroup> = {};
        let cartTotal = 0;

        for (const item of typedCart.items) {
            const product = item.variant.product;
            const store = product.store;

            if (!store) continue;

            if (!groups[store.id]) {
                groups[store.id] = {
                    storeId: store.id,
                    storeName: (store as unknown as Record<string, unknown>).businessName as string || "Unknown Store",
                    items: [],
                    subtotal: 0,
                    deliveryFee: 0,
                    deliveryFeeType: "FLAT",
                    canDeliver: false,
                };
            }

            groups[store.id].items.push(item);
            const price = Number(item.variant.price || 0);
            groups[store.id].subtotal += price * item.quantity;
            cartTotal += price * item.quantity;
        }

        // Calculate Fees per Group and Payable Total
        let totalPayable = 0;

        const resultGroups: SplitCartGroup[] = Object.values(groups).map(group => {
            const firstItem = group.items[0];
            const settings = firstItem.variant.product.store?.deliverySettings;

            let fee = 0;
            let feeType = "FLAT";
            let canDeliver = false;

            // baseDeliveryFee/deliveryFeeType may be dynamic JSON fields on deliverySettings
            const settingsRecord = settings as unknown as Record<string, unknown> | null;
            if (settings && settings.isEnabled) {
                canDeliver = true;
                fee = Number(settingsRecord?.baseDeliveryFee || 0);
                feeType = String(settingsRecord?.deliveryFeeType || "FLAT");
            } else {
                fee = 1000;
                canDeliver = true;
            }

            let groupPayable = fee;

            group.items.forEach((item) => {
                const product = item.variant.product;
                const price = Number(item.variant.price || 0) * item.quantity;

                const productRecord = product as unknown as Record<string, unknown>;
                if (productRecord.depositRequired && productRecord.depositPercentage) {
                    groupPayable += price * Number(productRecord.depositPercentage);
                } else {
                    groupPayable += price;
                }
            });

            totalPayable += groupPayable;

            return {
                ...group,
                deliveryFee: fee,
                deliveryFeeType: feeType,
                canDeliver
            };
        });

        return {
            id: cart.id,
            userId: cart.userId,
            items: typedCart.items,
            cartTotal,
            payableAmount: totalPayable,
            groups: resultGroups
        };
    }

    static async addItem(cartId: string, variantId: string, quantity: number = 1): Promise<Prisma.CartItemGetPayload<object> | null> {
        // Upsert logic handled by manual check to prevent race conditions or simple upsert
        // Prisma upsert on unique constraint [cartId, variantId]

        // 1. Fetch Product rules (MOQ)
        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true }
        });

        const product = variant?.product;
        if (!product) return null; // Should throw

        const moq = product.moq || 1;

        // If adding new item or incrementing, ensure final qty >= MOQ
        // For simple add, we just check if quantity < MOQ, we upgrade it.
        // But what if they already have 2, and add 1 (Total 3, MOQ 10)?
        // We'll trust the input 'quantity' is the ADDITION. 
        // We need to check existing cart item too? The "Simple" rule is: Can't have < MOQ in cart.

        // Simplification: If input quantity < MOQ, bump it up.
        // User adds 1, but MOQ is 10 -> We add 10.
        const effectiveQty = Math.max(quantity, moq);

        return prisma.cartItem.upsert({
            where: {
                cartId_variantId: {
                    cartId,
                    variantId
                }
            },
            create: {
                cartId,
                variantId,
                quantity: effectiveQty
            },
            update: {
                quantity: { increment: quantity } // Just increment by requested amount? Or force total to be >= MOQ?
                // Edge case: Current 0 (doesn't exist) -> Create 10.
                // Current 5 (below MOQ? shouldn't happen) -> Add 1 -> 6. 
                // Let's stick to simple "Add at least MOQ".
            }
        });
    }

    static async updateItem(itemId: string, quantity: number): Promise<Prisma.CartItemGetPayload<object>> {
        if (quantity <= 0) {
            return prisma.cartItem.delete({ where: { id: itemId } }) as unknown as Prisma.CartItemGetPayload<object>;
        }
        return prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity }
        });
    }

    static async removeItem(itemId: string): Promise<Prisma.CartItemGetPayload<object>> {
        return prisma.cartItem.delete({ where: { id: itemId } });
    }

    static async createCart(userId?: string, sessionToken?: string): Promise<Prisma.CartGetPayload<object>> {
        return prisma.cart.create({
            data: {
                userId,
                sessionToken
            }
        });
    }
}
