/**
 * Social Commerce Connectors
 * Instagram, Facebook, and TikTok Shop integrations
 */

import { createHmac } from 'node:crypto';
import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

// ============================================================
// Shared Types
// ============================================================

export interface SocialProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrls: string[];
  sku?: string;
  inventoryCount?: number;
  category?: string;
  brand?: string;
  url?: string;
}

export interface SocialOrder {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  customerId: string;
  customerName: string;
  customerEmail?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    currency: string;
  }>;
  total: number;
  currency: string;
  status: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
  createdAt: Date;
}

// ============================================================
// Instagram Shop Connector
// ============================================================

export interface InstagramConfig extends ConnectorConfig {
  accessToken: string;
  businessAccountId: string;
  catalogId?: string;
}

export class InstagramConnector {
  private config: InstagramConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: InstagramConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = endpoint.includes('?')
      ? `${this.baseUrl}${endpoint}&access_token=${this.config.accessToken}`
      : `${this.baseUrl}${endpoint}?access_token=${this.config.accessToken}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        error?: { message?: string; code?: number };
      };
      throw new Error(
        `Instagram API error: ${error.error?.message ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get Instagram Business account info
   */
  async getAccountInfo(): Promise<{
    id: string;
    name: string;
    username: string;
    followersCount: number;
    mediaCount: number;
  }> {
    const result = await this.request<{
      id: string;
      name: string;
      username: string;
      followers_count: number;
      media_count: number;
    }>(
      `/${this.config.businessAccountId}?fields=id,name,username,followers_count,media_count`
    );

    return {
      id: result.id,
      name: result.name,
      username: result.username,
      followersCount: result.followers_count,
      mediaCount: result.media_count,
    };
  }

  /**
   * Sync products to Instagram catalog
   */
  async syncProducts(products: SocialProduct[]): Promise<SyncResult> {
    if (!this.config.catalogId) {
      return {
        success: false,
        itemsSynced: 0,
        errors: ['No catalog ID configured'],
        lastSyncAt: new Date(),
      };
    }

    const errors: string[] = [];
    let itemsSynced = 0;

    for (const product of products) {
      try {
        await this.request(`/${this.config.catalogId}/products`, {
          method: 'POST',
          body: JSON.stringify({
            retailer_id: product.id,
            name: product.name,
            description: product.description,
            price: Math.round(product.price * 100), // in cents
            currency: product.currency,
            image_url: product.imageUrls[0],
            additional_image_urls: product.imageUrls.slice(1),
            brand: product.brand,
            category: product.category ?? 'other',
            availability: (product.inventoryCount ?? 0) > 0 ? 'in stock' : 'out of stock',
            condition: 'new',
            url: product.url ?? '',
          }),
        });
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to sync product ${product.id}: ${error}`);
      }
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Get recent Instagram media
   */
  async getRecentMedia(limit = 12): Promise<Array<{
    id: string;
    mediaType: string;
    mediaUrl: string;
    caption?: string;
    timestamp: Date;
    likeCount: number;
    commentsCount: number;
  }>> {
    const result = await this.request<{
      data: Array<{
        id: string;
        media_type: string;
        media_url: string;
        caption?: string;
        timestamp: string;
        like_count: number;
        comments_count: number;
      }>;
    }>(
      `/${this.config.businessAccountId}/media?fields=id,media_type,media_url,caption,timestamp,like_count,comments_count&limit=${limit}`
    );

    return result.data.map((m) => ({
      id: m.id,
      mediaType: m.media_type,
      mediaUrl: m.media_url,
      caption: m.caption,
      timestamp: new Date(m.timestamp),
      likeCount: m.like_count,
      commentsCount: m.comments_count,
    }));
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getAccountInfo();
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================
// Facebook Shop Connector
// ============================================================

export interface FacebookConfig extends ConnectorConfig {
  accessToken: string;
  pageId: string;
  catalogId?: string;
  shopId?: string;
}

export class FacebookConnector {
  private config: FacebookConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: FacebookConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = endpoint.includes('?')
      ? `${this.baseUrl}${endpoint}&access_token=${this.config.accessToken}`
      : `${this.baseUrl}${endpoint}?access_token=${this.config.accessToken}`;

    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      throw new Error(
        `Facebook API error: ${error.error?.message ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get Facebook Page info
   */
  async getPageInfo(): Promise<{
    id: string;
    name: string;
    fanCount: number;
    category: string;
  }> {
    const result = await this.request<{
      id: string;
      name: string;
      fan_count: number;
      category: string;
    }>(`/${this.config.pageId}?fields=id,name,fan_count,category`);

    return {
      id: result.id,
      name: result.name,
      fanCount: result.fan_count,
      category: result.category,
    };
  }

  /**
   * Sync products to Facebook catalog
   */
  async syncProducts(products: SocialProduct[]): Promise<SyncResult> {
    if (!this.config.catalogId) {
      return {
        success: false,
        itemsSynced: 0,
        errors: ['No catalog ID configured'],
        lastSyncAt: new Date(),
      };
    }

    const errors: string[] = [];
    let itemsSynced = 0;

    // Use batch product upload
    const items = products.map((p) => ({
      method: 'UPDATE',
      retailer_id: p.id,
      name: p.name,
      description: p.description,
      price: `${p.price} ${p.currency}`,
      image_url: p.imageUrls[0],
      url: p.url ?? '',
      availability: (p.inventoryCount ?? 0) > 0 ? 'in stock' : 'out of stock',
      condition: 'new',
      brand: p.brand,
    }));

    try {
      await this.request(`/${this.config.catalogId}/batch`, {
        method: 'POST',
        body: JSON.stringify({
          allow_upsert: true,
          requests: items,
        }),
      });
      itemsSynced = products.length;
    } catch (error) {
      errors.push(`Batch product sync failed: ${error}`);
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Get Facebook Shop orders
   */
  async getOrders(): Promise<SocialOrder[]> {
    if (!this.config.shopId) return [];

    try {
      const result = await this.request<{
        data: Array<{
          id: string;
          buyer_details: { name: string; email?: string };
          items: Array<{
            retailer_id: string;
            quantity: number;
            price_per_unit: { amount: string; currency: string };
          }>;
          estimated_payment_details: { total_amount: { amount: string; currency: string } };
          order_status: { state: string };
          created: string;
        }>;
      }>(`/${this.config.shopId}/orders?fields=id,buyer_details,items,estimated_payment_details,order_status,created`);

      return result.data.map((o) => ({
        id: o.id,
        platform: 'facebook' as const,
        customerId: o.buyer_details.name,
        customerName: o.buyer_details.name,
        customerEmail: o.buyer_details.email,
        items: o.items.map((i) => ({
          productId: i.retailer_id,
          quantity: i.quantity,
          price: parseFloat(i.price_per_unit.amount),
          currency: i.price_per_unit.currency,
        })),
        total: parseFloat(o.estimated_payment_details.total_amount.amount),
        currency: o.estimated_payment_details.total_amount.currency,
        status: o.order_status.state,
        createdAt: new Date(o.created),
      }));
    } catch {
      return [];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getPageInfo();
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================
// TikTok Shop Connector
// ============================================================

export interface TikTokConfig extends ConnectorConfig {
  appKey: string;
  appSecret: string;
  accessToken: string;
  shopId?: string;
}

export class TikTokShopConnector {
  private config: TikTokConfig;
  private baseUrl = 'https://open-api.tiktokglobalshop.com';

  constructor(config: TikTokConfig) {
    this.config = config;
  }

  private buildSignature(endpoint: string, params: Record<string, string>): string {
    // TikTok API signature - simplified placeholder
    // In production: HMAC-SHA256 with appSecret
    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}${params[k]}`)
      .join('');
    const stringToSign = `${this.config.appSecret}${endpoint}${sortedParams}${this.config.appSecret}`;
    return createHmac('sha256', this.config.appSecret).update(stringToSign).digest('hex');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params: Record<string, string> = {
      app_key: this.config.appKey,
      timestamp,
      access_token: this.config.accessToken,
    };

    const sign = this.buildSignature(endpoint, params);
    const queryString = new URLSearchParams({ ...params, sign }).toString();

    const response = await fetch(`${this.baseUrl}${endpoint}?${queryString}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-tts-access-token': this.config.accessToken,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        message?: string;
        code?: number;
      };
      throw new Error(
        `TikTok API error: ${error.code ?? ''} - ${error.message ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get shop info
   */
  async getShopInfo(): Promise<{ shopId: string; shopName: string; shopStatus: string }> {
    const result = await this.request<{
      data: { shop_id: string; shop_name: string; shop_status: string };
    }>('/api/shop/get_authorized_shop');

    this.config.shopId = result.data.shop_id;

    return {
      shopId: result.data.shop_id,
      shopName: result.data.shop_name,
      shopStatus: result.data.shop_status,
    };
  }

  /**
   * Sync products to TikTok Shop
   */
  async syncProducts(products: SocialProduct[]): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const product of products) {
      try {
        await this.request('/api/product/upload_img', {
          method: 'POST',
          body: JSON.stringify({
            img_url: product.imageUrls[0],
          }),
        });

        await this.request('/api/product/create_product', {
          method: 'POST',
          body: JSON.stringify({
            product_name: product.name,
            description: product.description,
            category_id: '600001',
            skus: [
              {
                seller_sku: product.sku ?? product.id,
                price: {
                  currency: product.currency,
                  original_price: product.price.toString(),
                },
                stock_infos: [
                  {
                    available_stock: product.inventoryCount ?? 99,
                  },
                ],
              },
            ],
          }),
        });
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to sync product ${product.id}: ${error}`);
      }
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Get TikTok Shop orders
   */
  async getOrders(from?: Date): Promise<SocialOrder[]> {
    try {
      const result = await this.request<{
        data: {
          order_list: Array<{
            order_id: string;
            buyer_user_id: string;
            recipient_address: {
              full_name: string;
              address_line1?: string;
              city?: string;
              state?: string;
              country?: string;
              zipcode?: string;
            };
            item_list: Array<{
              product_id: string;
              sku_id: string;
              quantity: number;
              sale_price: string;
              currency: string;
            }>;
            payment_info: { total_amount: string; currency: string };
            order_status: string;
            create_time: number;
          }>;
        };
      }>(`/api/order/list?page_size=100${from ? `&update_time_from=${Math.floor(from.getTime() / 1000)}` : ''}`);

      return (result.data.order_list ?? []).map((o) => ({
        id: o.order_id,
        platform: 'tiktok' as const,
        customerId: o.buyer_user_id,
        customerName: o.recipient_address.full_name,
        items: o.item_list.map((i) => ({
          productId: i.product_id,
          variantId: i.sku_id,
          quantity: i.quantity,
          price: parseFloat(i.sale_price),
          currency: i.currency,
        })),
        total: parseFloat(o.payment_info.total_amount),
        currency: o.payment_info.currency,
        status: o.order_status,
        shippingAddress: {
          street: o.recipient_address.address_line1 ?? '',
          city: o.recipient_address.city ?? '',
          state: o.recipient_address.state ?? '',
          country: o.recipient_address.country ?? '',
          zipCode: o.recipient_address.zipcode,
        },
        createdAt: new Date(o.create_time * 1000),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Update order shipping info
   */
  async shipOrder(orderId: string, trackingNumber: string, shippingProvider: string): Promise<boolean> {
    try {
      await this.request('/api/fulfill/order/ship_package', {
        method: 'POST',
        body: JSON.stringify({
          order_id: orderId,
          package_list: [
            {
              shipping_provider: shippingProvider,
              tracking_number: trackingNumber,
            },
          ],
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getShopInfo();
      return true;
    } catch {
      return false;
    }
  }
}

export default { InstagramConnector, FacebookConnector, TikTokShopConnector };
