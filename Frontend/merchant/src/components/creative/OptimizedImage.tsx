'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image Component using Vercel Image Optimization API
 * 
 * Features:
 * - Automatic format detection (WebP, AVIF)
 * - Responsive image loading
 * - Lazy loading by default
 * - Blur-up placeholder
 * - Error handling with fallback
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 75,
  className,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  const handleError = () => {
    setHasError(true);
    
    // Try fallback image (lower quality)
    if (!fallbackSrc) {
      const url = new URL(src, window.location.origin);
      url.searchParams.set('quality', '30');
      setFallbackSrc(url.toString());
    } else {
      // All fallbacks failed, call parent handler
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Render error state
  if (hasError && !fallbackSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <p className="text-sm font-medium">Failed to load image</p>
          <p className="text-xs mt-1">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={fill ? undefined : { width, height }}
    >
      {/* Blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/20 to-muted" />
      )}

      {/* Optimized image */}
      <Image
        src={fallbackSrc || src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        loading={priority ? 'eager' : 'lazy'}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * Portfolio Image Component with additional features
 */
interface PortfolioImageProps extends OptimizedImageProps {
  showBadge?: boolean;
  badgeText?: string;
  overlayOnHover?: boolean;
  onClick?: () => void;
}

export function PortfolioImage({
  src,
  alt,
  showBadge = false,
  badgeText,
  overlayOnHover = true,
  onClick,
  ...props
}: PortfolioImageProps) {
  return (
    <div
      className={`relative group cursor-pointer ${overlayOnHover ? 'hover:shadow-xl transition-shadow duration-300' : ''}`}
      onClick={onClick}
    >
      <OptimizedImage {...props} src={src} alt={alt} />

      {/* Badge */}
      {showBadge && badgeText && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          {badgeText}
        </div>
      )}

      {/* Hover overlay */}
      {overlayOnHover && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
            <h3 className="text-lg font-bold mb-2">{alt}</h3>
            <p className="text-sm opacity-90">Click to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Avatar Component with optimization
 */
interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
    xl: { width: 80, height: 80 },
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      {...sizeMap[size]}
      className={`rounded-full object-cover border-2 border-background ${className}`}
      sizes="(max-width: 768px) 32px, 40px"
    />
  );
}

/**
 * Responsive Gallery Grid
 */
interface GalleryGridProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: number;
  gap?: number;
}

export function GalleryGrid({
  images,
  columns = 3,
  gap = 4,
}: GalleryGridProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      {images.map((image, index) => (
        <PortfolioImage
          key={index}
          src={image.src}
          alt={image.alt}
          fill
          sizes={`(max-width: 768px) 100vw, ${(100 / columns).toFixed(1)}vw`}
          className="aspect-square"
        />
      ))}
    </div>
  );
}
