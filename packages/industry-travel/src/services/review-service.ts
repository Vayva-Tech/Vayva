import { 
  TravelProperty, 
  TravelBooking,
  TravelReview as ReviewType
} from '../types';

export interface ReviewSubmission {
  bookingId: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
}

export interface ReviewModeration {
  reviewId: string;
  action: 'approve' | 'reject' | 'request_changes';
  reason?: string;
  moderatorId: string;
}

export interface ReviewResponse {
  reviewId: string;
  response: string;
  responderId: string;
  isPublic: boolean;
}

export interface ReviewAnalytics {
  propertyId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  sentimentScore: number; // -1 to 1
  responseRate: number;
  recentReviews: ReviewType[];
}

export interface ReviewFilters {
  propertyId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'archived';
  minRating?: number;
  maxRating?: number;
  dateRange?: { start: Date; end: Date };
  hasPhotos?: boolean;
}

export class ReviewService {
  private sentimentAnalyzer: SentimentAnalyzer;

  constructor() {
    this.sentimentAnalyzer = new SentimentAnalyzer();
  }

  /**
   * Submit a new review
   */
  async submitReview(submission: ReviewSubmission): Promise<ReviewType> {
    // Validate submission
    if (submission.rating < 1 || submission.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    if (!submission.comment.trim()) {
      throw new Error('Review comment is required');
    }

    // Verify booking exists and is eligible for review
    const booking = await this.getBookingById(submission.bookingId);
    if (!booking) {
      throw new Error('Invalid booking ID');
    }

    if (booking.status !== 'completed') {
      throw new Error('Booking must be completed to submit review');
    }

    // Check if review already exists for this booking
    const existingReview = await this.getReviewByBookingId(submission.bookingId);
    if (existingReview) {
      throw new Error('Review already submitted for this booking');
    }

    // Analyze sentiment
    const sentiment = this.sentimentAnalyzer.analyze(submission.comment);
    
    // Create review
    const review: ReviewType = {
      id: this.generateId(),
      propertyId: submission.propertyId,
      bookingId: submission.bookingId,
      guestName: submission.guestName,
      rating: submission.rating,
      title: submission.title,
      comment: submission.comment,
      photos: submission.photos || [],
      status: 'pending', // Requires moderation
      sentimentScore: sentiment.score,
      sentimentLabel: sentiment.label,
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to database (mock implementation)
    await this.saveReview(review);
    
    // Send notification to property manager
    await this.sendReviewNotification(review);
    
    return review;
  }

  /**
   * Get reviews with filtering and pagination
   */
  async getReviews(filters: ReviewFilters = {}, page = 1, limit = 20): Promise<{
    reviews: ReviewType[];
    totalCount: number;
    hasNextPage: boolean;
  }> {
    // Mock implementation
    const reviews = await this.fetchReviewsFromDatabase(filters);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      reviews: reviews.slice(startIndex, endIndex),
      totalCount: reviews.length,
      hasNextPage: endIndex < reviews.length
    };
  }

  /**
   * Moderate a review
   */
  async moderateReview(moderation: ReviewModeration): Promise<ReviewType> {
    const review = await this.getReviewById(moderation.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Update review status
    review.status = moderation.action === 'approve' ? 'approved' : 
                   moderation.action === 'reject' ? 'rejected' : review.status;
    review.moderatedAt = new Date();
    review.moderatorId = moderation.moderatorId;
    review.moderationReason = moderation.reason;
    review.updatedAt = new Date();

    await this.updateReview(review);
    
    // Send notification to guest if rejected
    if (moderation.action === 'reject') {
      await this.sendRejectionNotification(review, moderation.reason);
    }

    return review;
  }

  /**
   * Respond to a review
   */
  async respondToReview(response: ReviewResponse): Promise<ReviewType> {
    const review = await this.getReviewById(response.reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.status !== 'approved') {
      throw new Error('Can only respond to approved reviews');
    }

    // Add response to review
    review.response = response.response;
    review.responderId = response.responderId;
    review.responsePublic = response.isPublic;
    review.respondedAt = new Date();
    review.updatedAt = new Date();

    await this.updateReview(review);
    
    // Send notification to guest
    await this.sendResponseNotification(review);
    
    return review;
  }

  /**
   * Calculate average rating for a property
   */
  async calculateAverageRating(propertyId: string): Promise<number> {
    const reviews = await this.getApprovedReviews(propertyId);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }

  /**
   * Get review analytics for a property
   */
  async getReviewAnalytics(propertyId: string): Promise<ReviewAnalytics> {
    const reviews = await this.getAllReviews(propertyId);
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    
    if (approvedReviews.length === 0) {
      return {
        propertyId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        sentimentScore: 0,
        responseRate: 0,
        recentReviews: []
      };
    }

    // Calculate average rating
    const averageRating = await this.calculateAverageRating(propertyId);
    
    // Rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    approvedReviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    // Sentiment analysis
    const sentimentScores = approvedReviews.map(r => r.sentimentScore || 0);
    const sentimentScore = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    
    // Response rate
    const respondedReviews = approvedReviews.filter(r => r.response).length;
    const responseRate = parseFloat(((respondedReviews / approvedReviews.length) * 100).toFixed(1));
    
    // Recent reviews (last 10)
    const recentReviews = approvedReviews
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      propertyId,
      averageRating,
      totalReviews: approvedReviews.length,
      ratingDistribution,
      sentimentScore,
      responseRate,
      recentReviews
    };
  }

  /**
   * Flag inappropriate review
   */
  async flagReview(reviewId: string, reason: string, userId: string): Promise<void> {
    const review = await this.getReviewById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Add flag record
    await this.addFlagRecord(reviewId, reason, userId);
    
    // Auto-moderate if too many flags
    const flagCount = await this.getFlagCount(reviewId);
    if (flagCount >= 3) {
      review.status = 'archived';
      review.updatedAt = new Date();
      await this.updateReview(review);
    }
  }

  /**
   * Get pending reviews for moderation
   */
  async getPendingReviews(limit = 50): Promise<ReviewType[]> {
    return await this.fetchReviewsFromDatabase({ status: 'pending' }, limit);
  }

  /**
   * Bulk moderate reviews
   */
  async bulkModerate(reviews: Array<{ reviewId: string; action: 'approve' | 'reject'; reason?: string }>, moderatorId: string): Promise<void> {
    for (const { reviewId, action, reason } of reviews) {
      await this.moderateReview({
        reviewId,
        action,
        reason,
        moderatorId
      });
    }
  }

  /**
   * Get review response suggestions based on sentiment
   */
  getResponseSuggestions(review: ReviewType): string[] {
    const suggestions = [];
    
    if (review.sentimentScore && review.sentimentScore < -0.3) {
      // Negative review - apology and solution focused
      suggestions.push(
        `Dear ${review.guestName}, we sincerely apologize for your disappointing experience. We've addressed the issues you mentioned and would welcome the opportunity to make it right.`,
        `Thank you for bringing these concerns to our attention, ${review.guestName}. We're taking immediate steps to improve in these areas.`
      );
    } else if (review.sentimentScore && review.sentimentScore > 0.3) {
      // Positive review - gratitude focused
      suggestions.push(
        `Thank you so much for your wonderful review, ${review.guestName}! We're thrilled you enjoyed your stay and hope to welcome you back soon.`,
        `We're delighted to hear about your positive experience, ${review.guestName}! Your kind words mean the world to our team.`
      );
    } else {
      // Neutral review - balanced response
      suggestions.push(
        `Thank you for your feedback, ${review.guestName}. We appreciate you taking the time to share your experience with us.`,
        `We're grateful for your review, ${review.guestName}, and will use your feedback to continue improving our service.`
      );
    }
    
    return suggestions;
  }

  // Private helper methods
  private async getBookingById(bookingId: string): Promise<TravelBooking | null> {
    // Mock implementation
    return null;
  }

  private async getReviewByBookingId(bookingId: string): Promise<ReviewType | null> {
    // Mock implementation
    return null;
  }

  private async getReviewById(reviewId: string): Promise<ReviewType | null> {
    // Mock implementation
    return null;
  }

  private async getApprovedReviews(propertyId: string): Promise<ReviewType[]> {
    // Mock implementation
    return [];
  }

  private async getAllReviews(propertyId: string): Promise<ReviewType[]> {
    // Mock implementation
    return [];
  }

  private async saveReview(review: ReviewType): Promise<void> {
    // Mock implementation
    console.log('Saving review:', review.id);
  }

  private async updateReview(review: ReviewType): Promise<void> {
    // Mock implementation
    console.log('Updating review:', review.id);
  }

  private async fetchReviewsFromDatabase(filters: ReviewFilters, limit?: number): Promise<ReviewType[]> {
    // Mock implementation
    return [];
  }

  private async sendReviewNotification(review: ReviewType): Promise<void> {
    // Mock implementation
    console.log('Sending review notification for:', review.id);
  }

  private async sendRejectionNotification(review: ReviewType, reason?: string): Promise<void> {
    // Mock implementation
    console.log('Sending rejection notification for:', review.id);
  }

  private async sendResponseNotification(review: ReviewType): Promise<void> {
    // Mock implementation
    console.log('Sending response notification for:', review.id);
  }

  private async addFlagRecord(reviewId: string, reason: string, userId: string): Promise<void> {
    // Mock implementation
    console.log('Adding flag record for review:', reviewId);
  }

  private async getFlagCount(reviewId: string): Promise<number> {
    // Mock implementation
    return 0;
  }

  private generateId(): string {
    return 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Simple sentiment analyzer
class SentimentAnalyzer {
  private positiveWords = ['excellent', 'great', 'amazing', 'wonderful', 'perfect', 'love', 'fantastic', 'awesome', 'brilliant', 'outstanding'];
  private negativeWords = ['terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disappointing', 'poor', 'disgusting', 'unacceptable'];

  analyze(text: string): { score: number; label: string } {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (this.positiveWords.includes(word)) positiveCount++;
      if (this.negativeWords.includes(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { score: 0, label: 'neutral' };
    }

    const score = (positiveCount - negativeCount) / total;
    
    let label = 'neutral';
    if (score > 0.3) label = 'positive';
    else if (score < -0.3) label = 'negative';

    return { score, label };
  }
}