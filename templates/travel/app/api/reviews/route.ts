import { NextResponse } from 'next/server';
import { ReviewService } from '@vayva/industry-travel/services';
import { PrismaClient } from '../../../../platform/infra/db/src/generated/client';

// Initialize service
const prisma = new PrismaClient();
const reviewService = new ReviewService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const hasPhotos = searchParams.get('hasPhotos');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filters
    const filters: any = {};
    
    if (propertyId) filters.propertyId = propertyId;
    if (status) filters.status = status;
    if (minRating) filters.minRating = parseInt(minRating);
    if (maxRating) filters.maxRating = parseInt(maxRating);
    if (hasPhotos) filters.hasPhotos = hasPhotos === 'true';

    // Get reviews
    const result = await reviewService.getReviews(filters, page, limit);

    // Sort results
    const sortedReviews = sortReviews(result.reviews, sortBy, sortOrder);

    // Get property analytics if propertyId is provided
    let analytics = null;
    if (propertyId) {
      analytics = await reviewService.getReviewAnalytics(propertyId);
    }

    return NextResponse.json({
      success: true,
      reviews: sortedReviews,
      pagination: {
        currentPage: page,
        totalPages: result.totalCount > 0 ? Math.ceil(result.totalCount / limit) : 0,
        totalItems: result.totalCount,
        hasNextPage: result.hasNextPage,
        hasPrevPage: page > 1
      },
      analytics,
      filters: {
        propertyId,
        status,
        ratingRange: minRating || maxRating ? { min: minRating, max: maxRating } : undefined,
        hasPhotos: hasPhotos === 'true'
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reviews',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['bookingId', 'propertyId', 'guestName', 'guestEmail', 'rating', 'comment'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate rating
    const rating = parseInt(body.rating);
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Submit review
    const review = await reviewService.submitReview({
      bookingId: body.bookingId,
      propertyId: body.propertyId,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      rating,
      title: body.title,
      comment: body.comment,
      photos: body.photos || []
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit review',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, action, ...data } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'moderate':
        if (!data.action) {
          return NextResponse.json(
            { success: false, error: 'Moderation action is required' },
            { status: 400 }
          );
        }
        result = await reviewService.moderateReview({
          reviewId,
          action: data.action,
          reason: data.reason,
          moderatorId: data.moderatorId || 'system'
        });
        break;
        
      case 'respond':
        if (!data.response) {
          return NextResponse.json(
            { success: false, error: 'Response text is required' },
            { status: 400 }
          );
        }
        result = await reviewService.respondToReview({
          reviewId,
          response: data.response,
          responderId: data.responderId || 'property_manager',
          isPublic: data.isPublic !== false
        });
        break;
        
      case 'flag':
        if (!data.reason) {
          return NextResponse.json(
            { success: false, error: 'Flag reason is required' },
            { status: 400 }
          );
        }
        await reviewService.flagReview(reviewId, data.reason, data.userId || 'anonymous');
        result = { message: 'Review flagged successfully' };
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Review ${action}d successfully`
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update review',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get review suggestions and analytics
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const action = searchParams.get('action');

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'analytics':
        result = await reviewService.getReviewAnalytics(propertyId);
        break;
        
      case 'pending':
        result = await reviewService.getPendingReviews(20);
        break;
        
      case 'average-rating':
        result = await reviewService.calculateAverageRating(propertyId);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      message: 'Data retrieved successfully'
    });

  } catch (error) {
    console.error('Error retrieving review data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve review data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function sortReviews(reviews: any[], sortBy: string, sortOrder: string) {
  return reviews.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'helpful':
        comparison = (a.helpfulCount || 0) - (b.helpfulCount || 0);
        break;
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
}

// Mock data for demonstration
const mockReviews = [
  {
    id: 'review_1',
    propertyId: 'property_1',
    bookingId: 'booking_123',
    guestName: 'John D.',
    rating: 5,
    title: 'Amazing stay!',
    comment: 'The hotel exceeded all my expectations. Great location, clean rooms, and excellent service.',
    photos: ['/review-photo-1.jpg'],
    status: 'approved',
    sentimentScore: 0.8,
    helpfulCount: 12,
    createdAt: new Date('2024-05-15'),
    response: 'Thank you for your wonderful review, John! We\'re delighted you enjoyed your stay.',
    respondedAt: new Date('2024-05-16')
  },
  {
    id: 'review_2',
    propertyId: 'property_1',
    bookingId: 'booking_124',
    guestName: 'Sarah M.',
    rating: 4,
    title: 'Good value for money',
    comment: 'Nice hotel with friendly staff. Room was clean but a bit small for the price.',
    status: 'approved',
    sentimentScore: 0.3,
    helpfulCount: 8,
    createdAt: new Date('2024-05-10')
  },
  {
    id: 'review_3',
    propertyId: 'property_1',
    bookingId: 'booking_125',
    guestName: 'Mike R.',
    rating: 3,
    title: 'Average experience',
    comment: 'Hotel was okay, nothing special. Breakfast was decent but nothing memorable.',
    status: 'approved',
    sentimentScore: 0.1,
    helpfulCount: 3,
    createdAt: new Date('2024-05-05')
  }
];