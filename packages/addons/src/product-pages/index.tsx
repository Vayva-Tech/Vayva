'use client';
import { Button } from "@vayva/ui";

/**
 * Product Pages Add-On Components
 * 
 * Enhanced product display components including:
 * - ProductGallery: Image gallery with zoom, thumbnails, lightbox
 * - ProductVariants: Color, size, and variant selectors
 * - ProductReviews: Review display and submission
 * - ProductRecommendations: Related products carousel
 * - ProductSpecifications: Tabbed product details
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  X,
  Maximize2,
  Heart,
  Share2,
  Package,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  thumbnail?: string;
}

interface ProductVariant {
  id: string;
  name: string;
  options: {
    id: string;
    value: string;
    available: boolean;
    imageOverride?: string;
  }[];
}

interface ProductReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  date: string;
  verified: boolean;
  helpful: number;
  images?: string[];
}

interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductSpecification {
  label: string;
  value: string;
}

// ============================================================================
// PRODUCT GALLERY
// ============================================================================

interface ProductGalleryProps {
  images: ProductImage[];
  className?: string;
  enableZoom?: boolean;
  enableLightbox?: boolean;
}

export function ProductGallery({ 
  images, 
  className, 
  enableZoom = true,
  enableLightbox = true 
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number } | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  const currentImage = images[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableZoom || !isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (images.length === 0) {
    return (
      <div className={cn('aspect-square bg-muted rounded-xl flex items-center justify-center', className)}>
        <Package className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div 
        className="relative aspect-square bg-muted rounded-xl overflow-hidden group"
        onMouseEnter={() => enableZoom && setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <motion.img
          key={currentImage.id}
          src={currentImage.url}
          alt={currentImage.alt}
          className={cn(
            'w-full h-full object-cover transition-transform duration-200',
            isZooming && 'scale-150'
          )}
          style={isZooming && zoomPosition ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          } : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Zoom Indicator */}
        {enableZoom && !isZooming && (
          <div className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-full">
            <ZoomIn className="w-4 h-4" />
          </div>
        )}

        {/* Lightbox Toggle */}
        {enableLightbox && (
          <Button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="View full screen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <Button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                currentIndex === index ? 'border-primary' : 'border-transparent hover:border-muted'
              )}
            >
              <img
                src={image.thumbnail || image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </Button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && enableLightbox && (
          <Lightbox
            images={images}
            currentIndex={currentIndex}
            onClose={() => setIsLightboxOpen(false)}
            onNavigate={setCurrentIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// LIGHTBOX
// ============================================================================

function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  images: ProductImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const handlePrev = () => {
    onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  const handleNext = () => {
    onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <motion.img
          key={currentIndex}
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          className="max-w-full max-h-full object-contain"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <Button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((image, index) => (
            <Button
              key={image.id}
              onClick={(e) => { e.stopPropagation(); onNavigate(index); }}
              className={cn(
                'w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors',
                currentIndex === index ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'
              )}
            >
              <img src={image.thumbnail || image.url} alt="" className="w-full h-full object-cover" />
            </Button>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </motion.div>
  );
}

// ============================================================================
// PRODUCT VARIANTS SELECTOR
// ============================================================================

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariants: Record<string, string>;
  onChange: (variantId: string, optionId: string) => void;
  className?: string;
}

export function ProductVariants({ 
  variants, 
  selectedVariants, 
  onChange,
  className 
}: ProductVariantsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {variants.map((variant) => (
        <div key={variant.id}>
          <p className="text-sm font-medium mb-2">
            {variant.name}: {selectedVariants[variant.id] && (
              <span className="text-muted-foreground font-normal">
                {variant.options.find(o => o.id === selectedVariants[variant.id])?.value}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selectedVariants[variant.id] === option.id;
              const isAvailable = option.available;

              // Color variant - show color swatch
              if (variant.name.toLowerCase().includes('color')) {
                return (
                  <Button
                    key={option.id}
                    onClick={() => isAvailable && onChange(variant.id, option.id)}
                    disabled={!isAvailable}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 transition-all',
                      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent',
                      !isAvailable && 'opacity-40 cursor-not-allowed'
                    )}
                    style={{ backgroundColor: option.value.toLowerCase() }}
                    title={option.value}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white m-auto" />}
                  </Button>
                );
              }

              // Size or other variants - show button
              return (
                <Button
                  key={option.id}
                  onClick={() => isAvailable && onChange(variant.id, option.id)}
                  disabled={!isAvailable}
                  className={cn(
                    'px-4 py-2 text-sm border rounded-lg transition-colors',
                    isSelected 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'hover:bg-accent',
                    !isAvailable && 'opacity-40 cursor-not-allowed line-through'
                  )}
                >
                  {option.value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PRODUCT REVIEWS
// ============================================================================

interface ProductReviewsProps {
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  className?: string;
}

export function ProductReviews({ 
  reviews, 
  averageRating, 
  totalReviews,
  className 
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'images'>('all');

  const filteredReviews = reviews.filter(review => {
    if (filter === 'verified') return review.verified;
    if (filter === 'images') return review.images && review.images.length > 0;
    return true;
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: (reviews.filter(r => r.rating === stars).length / totalReviews) * 100
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Average Rating */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Based on {totalReviews} reviews</span>
          </div>
        </div>
        <Button
          onClick={() => setShowReviewForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Write a Review
        </Button>
      </div>

      {/* Rating Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          {ratingDistribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="w-8 text-sm font-medium">{stars} ★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-sm text-muted-foreground text-right">{count}</span>
            </div>
          ))}
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 content-start">
          {[
            { id: 'all', label: `All Reviews (${totalReviews})` },
            { id: 'verified', label: `Verified (${reviews.filter(r => r.verified).length})` },
            { id: 'images', label: `With Images (${reviews.filter(r => r.images?.length).length})` },
          ].map(({ id, label }) => (
            <Button
              key={id}
              onClick={() => setFilter(id as typeof filter)}
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
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No reviews match the selected filter.
          </p>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewFormModal onClose={() => setShowReviewForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// REVIEW CARD
// ============================================================================

function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <div className="border rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  )}
                />
              ))}
            </div>
            <span className="font-medium">{review.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span>{review.author}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="w-3 h-3" />
                Verified Purchase
              </span>
            )}
            <span>·</span>
            <span>{review.date}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-muted-foreground">{review.content}</p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2">
          {review.images.map((image, index) => (
            <div key={index} className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Helpful */}
      <div className="flex items-center gap-4 pt-2 border-t">
        <span className="text-sm text-muted-foreground">
          {review.helpful} people found this helpful
        </span>
        <Button className="text-sm text-primary hover:underline">
          Helpful
        </Button>
        <Button className="text-sm text-muted-foreground hover:underline">
          Report
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// REVIEW FORM MODAL
// ============================================================================

function ReviewFormModal({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Write a Review</h3>
            <Button onClick={onClose} className="p-1 hover:bg-accent rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      'w-8 h-8',
                      (hoverRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </Button>
              ))}
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us what you liked or disliked"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
          </div>

          <Button
            onClick={onClose}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Submit Review
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// PRODUCT RECOMMENDATIONS
// ============================================================================

interface ProductRecommendationsProps {
  products: ProductRecommendation[];
  title?: string;
  className?: string;
}

export function ProductRecommendations({ 
  products, 
  title = "You May Also Like",
  className 
}: ProductRecommendationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => scroll('left')}
            className="p-2 border rounded-full hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => scroll('right')}
            className="p-2 border rounded-full hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.id}`}
            className="flex-shrink-0 w-64 group"
          >
            <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-semibold">₦{product.price.toLocaleString()}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₦{product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCT SPECIFICATIONS
// ============================================================================

interface ProductSpecificationsProps {
  specifications: ProductSpecification[];
  description?: string;
  className?: string;
}

export function ProductSpecifications({ 
  specifications, 
  description,
  className 
}: ProductSpecificationsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: 'description', label: 'Description' },
          { id: 'specs', label: 'Specifications' },
          { id: 'shipping', label: 'Shipping & Returns' },
        ].map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-[200px]"
        >
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none">
              {description || <p className="text-muted-foreground">No description available.</p>}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid sm:grid-cols-2 gap-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{spec.label}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    We ship nationwide within 3-7 business days. Express shipping available.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Returns</p>
                  <p className="text-sm text-muted-foreground">
                    30-day return policy. Items must be in original condition.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Warranty</p>
                  <p className="text-sm text-muted-foreground">
                    1-year manufacturer warranty included.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// PRODUCT TRUST BADGES
// ============================================================================

interface ProductTrustBadgesProps {
  className?: string;
}

export function ProductTrustBadges({ className }: ProductTrustBadgesProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Secure Payment</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Truck className="w-4 h-4" />
        <span>Fast Delivery</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw className="w-4 h-4" />
        <span>Easy Returns</span>
      </div>
    </div>
  );
}

// ============================================================================
// PRODUCT ACTIONS BAR
// ============================================================================

interface ProductActionsBarProps {
  onWishlist?: () => void;
  onShare?: () => void;
  isWishlisted?: boolean;
  className?: string;
}

export function ProductActionsBar({ 
  onWishlist, 
  onShare,
  isWishlisted = false,
  className 
}: ProductActionsBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        onClick={onWishlist}
        className={cn(
          'p-2 border rounded-lg transition-colors',
          isWishlisted ? 'text-red-500 border-red-200 bg-red-50' : 'hover:bg-accent'
        )}
        aria-label="Add to wishlist"
      >
        <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
      </Button>
      <Button
        onClick={onShare}
        className="p-2 border rounded-lg hover:bg-accent transition-colors"
        aria-label="Share product"
      >
        <Share2 className="w-5 h-5" />
      </Button>
    </div>
  );
}

