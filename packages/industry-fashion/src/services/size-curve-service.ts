import { fashionPrisma as prisma } from '../lib/prisma-fashion';

export interface ProductSizeCurveRow {
  size: string;
  salesCount: number;
  returnCount: number;
  stockLevel: number;
  sellThroughRate: number;
  returnRate: number;
}

export class SizeCurveService {
  /**
   * Calculate size curve for a product
   */
  async calculateSizeCurve(productId: string): Promise<ProductSizeCurveRow[]> {
    // Get order items for this product
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      include: {
        order: true,
      },
    });

    // Get current stock levels
    const variants = await prisma.productVariant.findMany({
      where: { productId },
    });

    // Aggregate by size
    const sizeMap = new Map<string, {
      sales: number;
      returns: number;
      stock: number;
    }>();

    // Count sales by size
    for (const item of orderItems) {
      const size = item.variantId || 'N/A';
      const current = sizeMap.get(size) || { sales: 0, returns: 0, stock: 0 };
      current.sales += item.quantity;
      sizeMap.set(size, current);
    }

    // Add stock levels
    for (const variant of variants) {
      const size = variant.size || 'N/A';
      const current = sizeMap.get(size) || { sales: 0, returns: 0, stock: 0 };
      current.stock = variant.inventoryQuantity;
      sizeMap.set(size, current);
    }

    // Calculate metrics
    const totalSales = Array.from(sizeMap.values()).reduce((sum, s) => sum + s.sales, 0);

    return Array.from(sizeMap.entries()).map(([size, data]) => ({
      size,
      salesCount: data.sales,
      returnCount: data.returns,
      stockLevel: data.stock,
      sellThroughRate: totalSales > 0 ? data.sales / totalSales : 0,
      returnRate: data.sales > 0 ? data.returns / data.sales : 0,
    }));
  }

  /**
   * Update size curve in database
   */
  async updateSizeCurve(productId: string): Promise<void> {
    const curve = await this.calculateSizeCurve(productId);

    // Delete old entries
    await prisma.sizeCurve.deleteMany({
      where: { productId },
    });

    // Insert new entries
    await prisma.sizeCurve.createMany({
      data: curve.map(c => ({
        productId,
        size: c.size,
        salesCount: c.salesCount,
        returnCount: c.returnCount,
        stockLevel: c.stockLevel,
      })),
    });
  }

  /**
   * Get size recommendations for restocking
   */
  async getRestockRecommendations(storeId: string): Promise<Array<{
    productId: string;
    productName: string;
    size: string;
    currentStock: number;
    recommendedStock: number;
    urgency: 'low' | 'medium' | 'high';
  }>> {
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        sizeCurves: true,
        productVariants: true,
      },
    });

    const recommendations: Array<{
      productId: string;
      productName: string;
      size: string;
      currentStock: number;
      recommendedStock: number;
      urgency: 'low' | 'medium' | 'high';
    }> = [];

    for (const product of products) {
      for (const curve of product.sizeCurves) {
        const sellThroughRate = curve.salesCount / (curve.salesCount + curve.stockLevel + 1);

        if (sellThroughRate > 0.7 && curve.stockLevel < 10) {
          recommendations.push({
            productId: product.id,
            productName: product.title,
            size: curve.size,
            currentStock: curve.stockLevel,
            recommendedStock: Math.ceil(curve.salesCount * 1.5),
            urgency: curve.stockLevel < 5 ? 'high' : 'medium',
          });
        }
      }
    }

    return recommendations.sort((a, b) =>
      a.urgency === 'high' ? -1 : b.urgency === 'high' ? 1 : 0
    );
  }
}

export const sizeCurveService = new SizeCurveService();
