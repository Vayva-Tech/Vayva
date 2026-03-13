/**
 * Table Model - WatermelonDB Implementation
 */

import { Model } from '@nozbe/watermelondb';
import { field, children } from '@nozbe/watermelondb/decorators';

export class TableModel extends Model {
  static table = 'tables';

  @field('name') name!: string;
  @field('capacity') capacity!: number;
  @field('status') status!: 'available' | 'occupied' | 'reserved' | 'maintenance';
  @field('location') location?: string;

  @children('orders') orders!: any;
}
