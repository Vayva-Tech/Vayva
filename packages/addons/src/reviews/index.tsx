'use client';
import { Button } from "@vayva/ui";

/**
 * Reviews & Ratings Add-On Components
 * 
 * Provides review functionality including:
 * - StarRating: Display and input star ratings
 * - ReviewCard: Individual review display
 * - ReviewForm: Write a review form
 * - ReviewSummary: Aggregate rating display
 * - ReviewList: Filterable review list
 * - PhotoReviewsGrid: Grid of photo reviews
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Check,
  AlertCircle,
  X,
  Flag,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  date: string;
  helpful: number;
  unhelpful: number;
  images?: string[];
  variants?: Record<string, string>;
  response?: {
    content: string;
    date: string;
    author: string;
  };
}

export interface RatingSummary {
  average: number;
  total: number;
  distribution: {
    stars: number;
    count: number;
    percentage: number;
  }[];
  breakdown: {
    quality: number;
    value: number;
    shipping: number;
  };
}

// ============================================================================
// STAR RATING (Display)
// ============================================================================

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = false,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[...Array(maxRating)].map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        
        return (
          <div key={i} className="relative">
            {/* Background star */}
            <Star className={cn(sizeClasses[size], 'text-muted-foreground/30')} />
            
            {/* Filled star overlay */}
            {(filled || partial) && (
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: partial ? `${(rating - i) * 100}%` : '100%' }}
              >
                <Star className={cn(
                  sizeClasses[size], 
                  'fill-yellow-400 text-yellow-400'
                )} />
              </div>
            )}
          </div>
        );
      })}
      
      {showValue && (
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// ============================================================================
// STAR RATING INPUT
// ============================================================================

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  labels?: string[];
  className?: string;
}

export function StarRatingInput({ 
  value, 
  onChange, 
  size = 'md',
  labels = ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'],
  className 
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const currentValue = hoverValue || value;
  const label = labels[currentValue - 1] || '';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            type="button"
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
            className={cn(
              'transition-transform hover:scale-110 focus:outline-none',
              currentValue >= star ? 'text-yellow-400' : 'text-muted-foreground/30'
            )}
          >
            <Star 
              className={cn(
                sizeClasses[size],
                currentValue >= star && 'fill-current'
              )} 
            />
          </Button>
        ))}
      </div>
      {label && (
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      )}
    </div>
  );
}

// ============================================================================
// RATING SUMMARY
// ============================================================================

interface RatingSummaryProps {
  summary: RatingSummary;
  className?: string;
}

export function RatingSummaryComponent({ summary, className }: RatingSummaryProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{summary.average.toFixed(1)}</div>
          <StarRating rating={summary.average} size="sm" className="justify-center mt-1" />
          <p className="text-sm text-muted-foreground mt-1">
            Based on {summary.total.toLocaleString()} reviews
          </p>
        </div>
        
        {/* Distribution */}
        <div className="flex-1 space-y-1">
          {summary.distribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-8 text-sm text-muted-foreground">{stars} ★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className="h-full bg-yellow-400 rounded-full"
                  transition={{ duration: 0.5, delay: 0.1 * (5 - stars) }}
                />
              </div>
              <span className="w-12 text-sm text-muted-foreground text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      {summary.breakdown && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-semibold">{summary.breakdown.quality.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Quality</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{summary.breakdown.value.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Value</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{summary.breakdown.shipping.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Shipping</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// REVIEW CARD
// ============================================================================

interface ReviewCardProps {
  review: Review;
  showProductInfo?: boolean;
  onHelpful?: (reviewId: string, helpful: boolean) => void;
  onReport?: (reviewId: string) => void;
  className?: string;
}

export function ReviewCard({ 
  review, 
  showProductInfo: _showProductInfo = false,
  onHelpful,
  onReport,
  className 
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showImages, setShowImages] = useState(false);
  
  const contentLimit = 300;
  const shouldTruncate = review.content.length > contentLimit;
  const displayContent = expanded ? review.content : review.content.slice(0, contentLimit);

  return (
    <div className={cn('border rounded-xl p-4 space-y-3', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {review.author.avatar ? (
            <img 
              src={review.author.avatar} 
              alt={review.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-medium text-primary">
                {review.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.author.name}</span>
              {review.author.verified && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                  <Check className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StarRating rating={review.rating} size="sm" />
              <span>·</span>
              <span>{review.date}</span>
            </div>
          </div>
        </div>
        
        {onReport && (
          <Button
            onClick={() => onReport(review.id)}
            className="p-1 text-muted-foreground hover:text-foreground"
            aria-label="Report review"
          >
            <Flag className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Title */}
      <h4 className="font-medium">{review.title}</h4>

      {/* Content */}
      <p className="text-muted-foreground">
        {displayContent}
        {shouldTruncate && !expanded && '...'}
      </p>
      
      {shouldTruncate && (
        <Button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-primary hover:underline"
        >
          {expanded ? 'Show less' : 'Read more'}
        </Button>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2">
          {(review.images ?? []).slice(0, 4).map((image, index) => {
            const imgs = review.images ?? [];
            return (
            <Button
              key={index}
              onClick={() => setShowImages(true)}
              className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0"
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
              {index === 3 && imgs.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                  +{imgs.length - 4}
                </div>
              )}
            </Button>
            );
          })}
        </div>
      )}

      {/* Variants */}
      {review.variants && Object.keys(review.variants).length > 0 && (
        <p className="text-sm text-muted-foreground">
          {Object.entries(review.variants).map(([key, value]) => `${key}: ${value}`).join(' · ')}
        </p>
      )}

      {/* Helpful Buttons */}
      <div className="flex items-center gap-4 pt-3 border-t">
        <span className="text-sm text-muted-foreground">
          {review.helpful} people found this helpful
        </span>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => onHelpful?.(review.id, true)}
            className="p-1.5 hover:bg-accent rounded transition-colors"
            aria-label="Mark as helpful"
          >
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onHelpful?.(review.id, false)}
            className="p-1.5 hover:bg-accent rounded transition-colors"
            aria-label="Mark as unhelpful"
          >
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Response */}
      {review.response && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">
            Response from {review.response.author}
          </p>
          <p className="text-sm text-muted-foreground">{review.response.content}</p>
          <p className="text-xs text-muted-foreground mt-1">{review.response.date}</p>
        </div>
      )}

      {/* Image Lightbox */}
      <AnimatePresence>
        {showImages && (
          <ImageLightbox 
            images={review.images || []} 
            onClose={() => setShowImages(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// REVIEW LIST
// ============================================================================

interface ReviewListProps {
  reviews: Review[];
  summary: RatingSummary;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

type FilterType = 'all' | 'verified' | 'images' | 'positive' | 'negative';
type SortType = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';

export function ReviewList({ 
  reviews, 
  summary,
  onLoadMore,
  hasMore = false,
  className 
}: ReviewListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');

  const filteredReviews = reviews.filter(review => {
    switch (filter) {
      case 'verified':
        return review.author.verified;
      case 'images':
        return review.images && review.images.length > 0;
      case 'positive':
        return review.rating >= 4;
      case 'negative':
        return review.rating <= 2;
      default:
        return true;
    }
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      case 'newest':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const filterButtons: { id: FilterType; label: string; count?: number }[] = [
    { id: 'all', label: `All (${summary.total})` },
    { id: 'verified', label: 'Verified', count: reviews.filter(r => r.author.verified).length },
    { id: 'images', label: 'With Images', count: reviews.filter(r => r.images?.length).length },
    { id: 'positive', label: 'Positive', count: reviews.filter(r => r.rating >= 4).length },
    { id: 'negative', label: 'Critical', count: reviews.filter(r => r.rating <= 2).length },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary */}
      <RatingSummaryComponent summary={summary} />

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(({ id, label }) => (
            <Button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-full border transition-colors',
                filter === id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-muted hover:bg-accent'
              )}
            >
              {label}
            </Button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortType)}
          className="px-3 py-1.5 text-sm border rounded-lg bg-background"
        >
          <option value="newest">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No reviews match the selected filter.
            </p>
          </div>
        ) : (
          sortedReviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            className="px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors"
          >
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// REVIEW FORM
// ============================================================================

interface ReviewFormProps {
  productId: string;
  variants?: { name: string; value: string }[];
  onSubmit: (review: Omit<Review, 'id' | 'author' | 'date' | 'helpful' | 'unhelpful'>) => void;
  className?: string;
}

export function ReviewForm({ productId, variants: _variants, onSubmit, className }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState({ quality: 0, value: 0, shipping: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (rating === 0) newErrors.rating = 'Please select a rating';
    if (title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (content.trim().length < 10) newErrors.content = 'Review must be at least 10 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      productId,
      rating,
      title,
      content,
      images: images.length > 0 ? images : undefined,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In real implementation, upload to server and get URLs
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Overall Rating */}
      <div className="text-center">
        <label className="block font-medium mb-3">How would you rate this product?</label>
        <StarRatingInput value={rating} onChange={setRating} size="lg" />
        {errors.rating && <p className="text-sm text-destructive mt-2">{errors.rating}</p>}
      </div>

      {/* Rating Breakdown */}
      <div className="grid sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <label className="text-sm text-muted-foreground block mb-2">Quality</label>
          <StarRatingInput 
            value={breakdown.quality} 
            onChange={(v) => setBreakdown(prev => ({ ...prev, quality: v }))}
            size="sm"
            labels={[]}
          />
        </div>
        <div className="text-center">
          <label className="text-sm text-muted-foreground block mb-2">Value</label>
          <StarRatingInput 
            value={breakdown.value} 
            onChange={(v) => setBreakdown(prev => ({ ...prev, value: v }))}
            size="sm"
            labels={[]}
          />
        </div>
        <div className="text-center">
          <label className="text-sm text-muted-foreground block mb-2">Shipping</label>
          <StarRatingInput 
            value={breakdown.shipping} 
            onChange={(v) => setBreakdown(prev => ({ ...prev, shipping: v }))}
            size="sm"
            labels={[]}
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Review Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none',
            errors.title && 'border-destructive'
          )}
        />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you like or dislike? How was the quality?"
          rows={5}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none',
            errors.content && 'border-destructive'
          )}
        />
        {errors.content && <p className="text-sm text-destructive mt-1">{errors.content}</p>}
        <p className="text-xs text-muted-foreground mt-1">{content.length} characters</p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Add Photos (optional)</label>
        <div className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
              <img src={image} alt="" className="w-full h-full object-cover" />
              <Button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="w-20 h-20 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
              <Camera className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Max 5 photos, 5MB each</p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Submit Review
      </Button>
    </form>
  );
}

// ============================================================================
// PHOTO REVIEWS GRID
// ============================================================================

interface PhotoReviewsGridProps {
  reviews: Review[];
  onPhotoClick?: (review: Review, photoIndex: number) => void;
  className?: string;
}

export function PhotoReviewsGrid({ reviews, onPhotoClick, className }: PhotoReviewsGridProps) {
  const photoReviews = reviews.filter(r => r.images && r.images.length > 0);
  const allPhotos = photoReviews.flatMap(review => 
    (review.images || []).map((photo, index) => ({ review, photo, index }))
  );

  if (allPhotos.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-semibold">Customer Photos ({allPhotos.length})</h3>
      
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {allPhotos.slice(0, 12).map(({ review, photo, index }, i) => (
          <Button
            key={`${review.id}-${index}`}
            onClick={() => onPhotoClick?.(review, index)}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
          >
            <img src={photo} alt="" className="w-full h-full object-cover" />
            {i === 11 && allPhotos.length > 12 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium">
                +{allPhotos.length - 12}
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </Button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// IMAGE LIGHTBOX
// ============================================================================

function ImageLightbox({ images, onClose }: { images: string[]; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full z-10"
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="relative w-full h-full flex items-center justify-center p-4">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt=""
          className="max-w-full max-h-full object-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
        />

        {images.length > 1 && (
          <>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
              }}
              className="absolute left-4 p-3 bg-white/10 rounded-full text-white"
            >
              ←
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 p-3 bg-white/10 rounded-full text-white"
            >
              →
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <Button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                currentIndex === index ? 'bg-white' : 'bg-white/50'
              )}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

