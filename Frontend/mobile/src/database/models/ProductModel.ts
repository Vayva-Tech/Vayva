/**
 * Product Model - WatermelonDB Implementation
 */

import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class ProductModel extends Model {
  static table = 'products';

  @field('name') name!: string;
  @field('sku') sku!: string;
  @field('price') price!: number;
  @field('cost') cost?: number;
  @field('stock_quantity') stockQuantity!: number;
  @field('category') category?: string;
  @field('description') description?: string;
}
