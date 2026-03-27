import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class ReviewService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string) {
    const reviews = await this.db.review.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch basic product info manually since relation might not be established in schema
    const productIds = reviews
      .map((r) => r.productId)
      .filter((id): id is string => id !== null);
    
    const products = await this.db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true, handle: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.title]));

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      status: review.status,
      customerName: 'Anonymous Customer',
      product: review.productId ? productMap.get(review.productId) || 'Unknown Product' : 'Unknown Product',
      createdAt: review.createdAt,
    }));
  }

  async approve(reviewId: string, storeId: string) {
    const review = await this.db.review.findFirst({
      where: { id: reviewId, storeId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const updated = await this.db.review.update({
      where: { id: reviewId },
      data: { status: 'APPROVED' },
    });

    logger.info(`[Review] Approved ${reviewId}`);
    return updated;
  }

  async reject(reviewId: string, storeId: string) {
    const review = await this.db.review.findFirst({
      where: { id: reviewId, storeId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const updated = await this.db.review.update({
      where: { id: reviewId },
      data: { status: 'REJECTED' },
    });

    logger.info(`[Review] Rejected ${reviewId}`);
    return updated;
  }

  async delete(reviewId: string, storeId: string) {
    const review = await this.db.review.findFirst({
      where: { id: reviewId, storeId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    await this.db.review.delete({
      where: { id: reviewId },
    });

    logger.info(`[Review] Deleted ${reviewId}`);
    return { success: true };
  }
}
