import { prisma } from '@vayva/prisma';

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
  images?: string[];
}

export interface ReviewMetrics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  recommendationRate: number;
  responseRate: number;
  avgResponseTime: number; // hours
}

export class ReviewSystemIntegrationService {
  /**
   * Integrate with review platforms (Yotpo, Judge.me, Trustpilot, etc.)
   * or use native review system
   */

  /**
   * Get reviews for a product
   */
  async getProductReviews(productId: string, limit: number = 10): Promise<Review[]> {
    // TODO: Integrate with external review platforms via API
    // For now, use Prisma to fetch from database
    
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        customer: true,
        product: true,
      },
    });

    return reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      customerId: r.customerId,
      rating: r.rating,
      title: r.title || '',
      comment: r.comment || '',
      verified: r.verifiedPurchase,
      helpful: r.helpfulCount || 0,
      createdAt: r.createdAt,
      images: r.images || [],
    }));
  }

  /**
   * Get review metrics for dashboard
   */
  async getReviewMetrics(storeId: string): Promise<ReviewMetrics> {
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        reviews: true,
      },
    });

    const allReviews = products.flatMap((p) => p.reviews);
    const totalReviews = allReviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recommendationRate: 0,
        responseRate: 0,
        avgResponseTime: 0,
      };
    }

    // Calculate average rating
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    // Rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((r) => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    // Recommendation rate (4-5 star reviews)
    const recommendedReviews = allReviews.filter((r) => r.rating >= 4).length;
    const recommendationRate = recommendedReviews / totalReviews;

    // Response rate (reviews with merchant responses)
    const respondedReviews = allReviews.filter((r) => r.merchantResponse).length;
    const responseRate = respondedReviews / totalReviews;

    // Average response time (mock calculation)
    const avgResponseTime = 24 + Math.random() * 48; // 24-72 hours

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
      recommendationRate,
      responseRate,
      avgResponseTime,
    };
  }

  /**
   * Submit a new review
   */
  async submitReview(data: {
    productId: string;
    customerId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<Review> {
    // TODO: Integrate with review moderation services
    // Would check for spam, inappropriate content, etc.
    
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        customerId: data.customerId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        verifiedPurchase: true, // Would verify from order history
        images: data.images || [],
      },
      include: {
        customer: true,
        product: true,
      },
    });

    return {
      id: review.id,
      productId: review.productId,
      customerId: review.customerId,
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || '',
      verified: review.verifiedPurchase,
      helpful: review.helpfulCount || 0,
      createdAt: review.createdAt,
      images: review.images || [],
    };
  }

  /**
   * Respond to a review (merchant response)
   */
  async respondToReview(
    reviewId: string,
    response: string,
    respondedBy: string
  ): Promise<void> {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        merchantResponse: response,
        respondedAt: new Date(),
        respondedBy,
      },
    });
  }

  /**
   * Get recent reviews for activity feed
   */
  async getRecentReviews(storeId: string, limit: number = 5): Promise<Review[]> {
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            customer: true,
            product: true,
          },
        },
      },
    });

    const allReviews = products.flatMap((p) => p.reviews);
    return allReviews
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        productId: r.productId,
        customerId: r.customerId,
        rating: r.rating,
        title: r.title || '',
        comment: r.comment || '',
        verified: r.verifiedPurchase,
        helpful: r.helpfulCount || 0,
        createdAt: r.createdAt,
        images: r.images || [],
      }));
  }

  /**
   * Request reviews from customers (post-purchase)
   */
  async requestReview(customerId: string, orderId: string): Promise<void> {
    // TODO: Integrate with email/SMS services to send review requests
    // Would be triggered automatically after delivery confirmation
    
    console.log(`Sending review request to customer ${customerId} for order ${orderId}`);
  }

  /**
   * Aggregate reviews by product and calculate sentiment
   */
  async getProductSentimentAnalysis(productId: string): Promise<{
    positive: number;
    neutral: number;
    negative: number;
    topKeywords: string[];
    commonPraises: string[];
    commonComplaints: string[];
  }> {
    // TODO: Integrate with NLP/AI services for sentiment analysis
    // Would analyze review text for sentiment and extract key themes
    
    const reviews = await this.getProductReviews(productId, 100);
    
    // Mock implementation
    return {
      positive: 0.72,
      neutral: 0.18,
      negative: 0.10,
      topKeywords: ['quality', 'fit', 'comfortable', 'style', 'value'],
      commonPraises: ['Great quality', 'True to size', 'Fast shipping'],
      commonComplaints: ['Runs small', 'Color different from photo'],
    };
  }
}

// Export singleton instance
export const reviewSystemIntegration = new ReviewSystemIntegrationService();
