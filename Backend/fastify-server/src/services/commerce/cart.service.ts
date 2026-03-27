import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Cart Service - Backend
 * Manages shopping carts and cart items
 */
export class CartService {
  constructor(private readonly db = prisma) {}

  /**
   * Get or create cart for customer
   */
  async getOrCreateCart(storeId: string, customerId?: string, sessionId?: string) {
    let cart = await this.db.cart.findFirst({
      where: {
        storeId,
        customerId: customerId || null,
        sessionId: sessionId || null,
        status: 'ACTIVE',
      },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await this.db.cart.create({
        data: {
          id: `cart-${Date.now()}`,
          storeId,
          customerId: customerId || null,
          sessionId: sessionId || null,
          status: 'ACTIVE',
          currency: 'NGN',
        },
      });
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addItemToCart(
    cartId: string,
    storeId: string,
    itemData: {
      productId: string;
      variantId?: string;
      quantity: number;
      customPrice?: number;
      metadata?: any;
    }
  ) {
    const cart = await this.getCartById(cartId, storeId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Get product/variant details
    const variant = itemData.variantId 
      ? await this.db.productVariant.findUnique({
          where: { id: itemData.variantId },
        })
      : null;

    const product = await this.db.product.findUnique({
      where: { id: itemData.productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const unitPrice = itemData.customPrice || variant?.price || product.price || 0;
    const totalPrice = unitPrice * itemData.quantity;

    // Check if item already exists in cart
    const existingItem = await this.db.cartItem.findFirst({
      where: {
        cartId,
        productId: itemData.productId,
        variantId: itemData.variantId || null,
      },
    });

    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + itemData.quantity;
      const newTotalPrice = unitPrice * newQuantity;

      await this.db.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          totalPrice: newTotalPrice,
        },
      });

      logger.info(`[Cart] Updated item ${existingItem.id} quantity`);
      return { ...existingItem, quantity: newQuantity, totalPrice: newTotalPrice };
    } else {
      // Create new cart item
      const newItem = await this.db.cartItem.create({
        data: {
          id: `ci-${Date.now()}`,
          cartId,
          productId: itemData.productId,
          variantId: itemData.variantId || null,
          productName: product.name,
          variantName: variant?.name || null,
          quantity: itemData.quantity,
          unitPrice,
          totalPrice,
          metadata: itemData.metadata || {},
        },
      });

      logger.info(`[Cart] Added item ${newItem.id} to cart`);
      return newItem;
    }
  }

  /**
   * Update cart item
   */
  async updateCartItem(
    itemId: string,
    storeId: string,
    updates: {
      quantity?: number;
      customPrice?: number;
      metadata?: any;
    }
  ) {
    const item = await this.db.cartItem.findFirst({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.storeId !== storeId) {
      throw new Error('Cart item not found');
    }

    const updateData: any = {};

    if (updates.quantity !== undefined) {
      updateData.quantity = updates.quantity;
      updateData.totalPrice = updates.quantity * item.unitPrice;
    }

    if (updates.customPrice !== undefined) {
      updateData.unitPrice = updates.customPrice;
      updateData.totalPrice = updates.customPrice * item.quantity;
    }

    if (updates.metadata) {
      updateData.metadata = updates.metadata;
    }

    const updated = await this.db.cartItem.update({
      where: { id: itemId },
      data: updateData,
    });

    logger.info(`[Cart] Updated item ${itemId}`);
    return updated;
  }

  /**
   * Remove item from cart
   */
  async removeCartItem(itemId: string, storeId: string) {
    const item = await this.db.cartItem.findFirst({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.storeId !== storeId) {
      throw new Error('Cart item not found');
    }

    await this.db.cartItem.delete({
      where: { id: itemId },
    });

    logger.info(`[Cart] Removed item ${itemId}`);
    return { success: true };
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: string, storeId: string) {
    const cart = await this.getCartById(cartId, storeId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    await this.db.cartItem.deleteMany({
      where: { cartId },
    });

    logger.info(`[Cart] Cleared cart ${cartId}`);
    return { success: true };
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(cartId: string, storeId: string, couponCode: string) {
    const cart = await this.getCartById(cartId, storeId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    const coupon = await this.db.coupon.findFirst({
      where: {
        code: couponCode,
        storeId,
        status: 'ACTIVE',
      },
    });

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    // Check if coupon is applicable to cart
    if (coupon.minPurchaseAmount && cart.subtotal < coupon.minPurchaseAmount) {
      throw new Error(`Minimum purchase of ${coupon.minPurchaseAmount} required`);
    }

    await this.db.cart.update({
      where: { id: cartId },
      data: {
        couponId: coupon.id,
        discountAmount: this.calculateDiscount(cart.subtotal, coupon),
      },
    });

    logger.info(`[Cart] Applied coupon ${couponCode} to cart ${cartId}`);
    return coupon;
  }

  /**
   * Calculate cart totals
   */
  async calculateCartTotals(cartId: string, storeId: string) {
    const cart = await this.getCartById(cartId, storeId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = cart.discountAmount || 0;
    const shipping = cart.shippingCost || 0;
    const tax = cart.taxAmount || 0;
    const total = subtotal - discount + shipping + tax;

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  /**
   * Update cart shipping info
   */
  async updateCartShipping(
    cartId: string,
    storeId: string,
    shippingData: {
      shippingAddress?: any;
      shippingMethod?: string;
      shippingCost?: number;
    }
  ) {
    const cart = await this.getCartById(cartId, storeId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    const updateData: any = {};

    if (shippingData.shippingAddress) {
      updateData.shippingAddress = shippingData.shippingAddress;
    }

    if (shippingData.shippingMethod) {
      updateData.shippingMethod = shippingData.shippingMethod;
    }

    if (shippingData.shippingCost !== undefined) {
      updateData.shippingCost = shippingData.shippingCost;
    }

    const updated = await this.db.cart.update({
      where: { id: cartId },
      data: updateData,
    });

    logger.info(`[Cart] Updated shipping for cart ${cartId}`);
    return updated;
  }

  /**
   * Abandon cart
   */
  async abandonCart(cartId: string, storeId: string) {
    const cart = await this.getCartById(cartId, storeId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    await this.db.cart.update({
      where: { id: cartId },
      data: { status: 'ABANDONED' },
    });

    logger.info(`[Cart] Abandoned cart ${cartId}`);
    return { success: true };
  }

  /**
   * Get cart by ID
   */
  async getCartById(cartId: string, storeId: string) {
    return await this.db.cart.findFirst({
      where: { id: cartId, storeId },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
        coupon: true,
      },
    });
  }

  /**
   * Get abandoned carts
   */
  async getAbandonedCarts(storeId: string, filters?: {
    daysAgo?: number;
    minValue?: number;
  }) {
    const daysAgo = filters?.daysAgo || 7;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysAgo);

    const where: any = {
      storeId,
      status: 'ABANDONED',
      updatedAt: { lte: fromDate },
    };

    if (filters?.minValue) {
      where.subtotal = { gte: filters.minValue };
    }

    return await this.db.cart.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        items: true,
        customer: true,
      },
    });
  }

  /**
   * Calculate discount based on coupon type
   */
  private calculateDiscount(subtotal: number, coupon: any): number {
    if (coupon.type === 'FIXED') {
      return Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'PERCENTAGE') {
      return (subtotal * coupon.value) / 100;
    }
    return 0;
  }
}
