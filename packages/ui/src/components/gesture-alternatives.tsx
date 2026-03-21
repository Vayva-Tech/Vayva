/**
 * Gesture Alternatives for Accessibility
 * WCAG 2.1 AA Compliance - Success Criterion 2.5.1 (Pointer Gestures)
 * 
 * All gesture-based interactions MUST have alternative controls for users who cannot perform complex gestures.
 */

import React from 'react';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';

// ============================================================================
// EXAMPLE 1: Image Carousel with Swipe + Button Controls
// ============================================================================

interface CarouselProps {
  images: Array<{ src: string; alt: string }>;
}

/**
 * Accessible Image Carousel
 * Provides both swipe gestures AND explicit button controls
 */
export function AccessibleCarousel({ images }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="accessible-carousel relative">
      {/* Image display area */}
      <div className="carousel-viewport">
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          role="img"
          aria-roledescription="carousel"
          aria-label={`Image ${currentIndex + 1} of ${images.length}: ${images[currentIndex].alt}`}
        />
      </div>

      {/* Gesture controls (swipe works here) */}
      {/* Touch/swipe events would be handled by a library like react-swipeable */}

      {/* Explicit button alternatives for accessibility */}
      <div className="carousel-controls flex gap-2 mt-4 justify-center">
        <Button
          onClick={goToPrevious}
          aria-label={`Previous image (${currentIndex === 0 ? images.length : currentIndex} of ${images.length})`}
          size="icon"
          variant="secondary"
        >
          <Icon name="ChevronLeft" role="presentation" />
          Previous
        </Button>

        <Button
          onClick={goToNext}
          aria-label={`Next image (${currentIndex === images.length - 1 ? 1 : currentIndex + 2} of ${images.length})`}
          size="icon"
          variant="secondary"
        >
          Next
          <Icon name="ChevronRight" role="presentation" />
        </Button>
      </div>

      {/* Progress indicators */}
      <div className="carousel-indicators flex gap-2 mt-2 justify-center" role="tablist" aria-label="Carousel navigation">
        {images.map((_, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Go to image ${index + 1}`}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Zoom Controls with Pinch + Buttons
// ============================================================================

interface ZoomableImageProps {
  src: string;
  alt: string;
}

/**
 * Accessible Zoomable Image
 * Provides both pinch-to-zoom AND explicit zoom controls
 */
export function AccessibleZoomableImage({ src, alt }: ZoomableImageProps) {
  const [zoom, setZoom] = React.useState(1);
  const minZoom = 1;
  const maxZoom = 3;
  const zoomStep = 0.5;

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + zoomStep, maxZoom));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - zoomStep, minZoom));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <div className="zoomable-image-container">
      {/* Image with transform for zoom */}
      <div className="image-viewport overflow-hidden">
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
          }}
          // Pinch zoom can be handled here with touch events
        />
      </div>

      {/* Explicit zoom controls */}
      <div className="zoom-controls flex gap-2 mt-4" role="group" aria-label="Image zoom controls">
        <Button
          onClick={zoomOut}
          disabled={zoom <= minZoom}
          aria-label="Zoom out"
          size="icon"
          variant="secondary"
        >
          <Icon name="Minus" role="presentation" />
        </Button>

        <Button
          onClick={resetZoom}
          aria-label="Reset zoom to normal size"
          variant="outline"
        >
          {Math.round(zoom * 100)}%
        </Button>

        <Button
          onClick={zoomIn}
          disabled={zoom >= maxZoom}
          aria-label="Zoom in"
          size="icon"
          variant="secondary"
        >
          <Icon name="Plus" role="presentation" />
        </Button>
      </div>

      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        Image zoomed to {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Long Press Alternative with Info Button
// ============================================================================

interface ProductCardProps {
  productName: string;
  productDescription: string;
  onQuickView: () => void;
}

/**
 * Accessible Product Card
 * Provides both long press AND explicit info button
 */
export function AccessibleProductCard({ 
  productName, 
  productDescription, 
  onQuickView 
}: ProductCardProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  // Long press handler (for touch devices)
  const handleLongPress = React.useCallback(() => {
    setShowDetails(true);
  }, []);

  return (
    <div className="product-card border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{productName}</h3>
        
        {/* Explicit info button alternative to long press */}
        <Button
          onClick={() => setShowDetails(!showDetails)}
          variant="ghost"
          size="sm"
          aria-label={`Show details for ${productName}`}
          aria-expanded={showDetails}
        >
          <Icon name="Info" role="presentation" />
          <span className="sr-only">Product Information</span>
        </Button>
      </div>

      <p className="text-sm text-gray-600 mb-3">{productDescription}</p>

      {/* Details panel */}
      {showDetails && (
        <div 
          role="region"
          aria-label={`${productName} details`}
          className="mt-3 p-3 bg-gray-50 rounded"
        >
          <Button onClick={onQuickView} variant="primary" size="sm">
            Quick View
          </Button>
        </div>
      )}

      {/* Long press can be implemented here for touch devices */}
      {/* But the explicit button is always available */}
    </div>
  );
}

// ============================================================================
// DOCUMENTATION: Unsupported Gestures
// ============================================================================

/**
 * GESTURES THAT REQUIRE ALTERNATIVES:
 * 
 * 1. SWIPE LEFT/RIGHT → Provide Previous/Next buttons
 * 2. PINCH TO ZOOM → Provide explicit +/- zoom buttons
 * 3. LONG PRESS → Provide explicit action button
 * 4. TWO-FINGER ROTATE → Provide rotation slider or buttons
 * 5. THREE-FINGER SWIPE → Provide explicit navigation controls
 * 6. PULL TO REFRESH → Provide explicit refresh button
 * 
 * BEST PRACTICES:
 * 
 * ✅ Always provide visible button alternatives
 * ✅ Ensure all controls are keyboard accessible
 * ✅ Use ARIA labels to describe actions
 * ✅ Announce state changes to screen readers
 * ✅ Make touch targets at least 44x44px
 * ✅ Test with actual assistive technology users
 * 
 * NOT YET SUPPORTED:
 * 
 * ⚠️ Two-finger rotate gesture - No alternative implemented yet
 * ⚠️ Voice control shortcuts - Working on compatibility
 * ⚠️ Switch device scanning - Investigating improvements
 */
