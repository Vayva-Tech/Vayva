/**
 * Order Model - WatermelonDB Implementation
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export class OrderModel extends Model {
  static table = 'orders';

  @field('customer_id') customerId!: string;
  @field('table_id') tableId?: string;
  @field('status') status!: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  @field('items') items!: unknown[]; // JSON array of order items
  @field('subtotal') subtotal!: number;
  @field('tax') tax!: number;
  @field('total') total!: number;
  @field('payment_method') paymentMethod?: string;

  /** Linked restaurant table (renamed to avoid clashing with `Model.table`). */
  @relation('tables', 'table_id') linkedTable?: unknown;
}
