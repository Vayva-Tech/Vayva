/**
 * OptimizedImage Component
 * 
 * Provides automatic image optimization using Cloudflare Images CDN.
 * Falls back to Next.js Image component when Cloudflare is not available.
 * 
 * Features:
 * - Automatic format conversion (WebP/AVIF)
 * - Responsive sizing
 * - Lazy loading
 * - Placeholder support
 * - SEO-friendly alt text
 */

import React, { useState, useCallback } from "react";
import Image from "next/image";

export interface OptimizedImageProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility and SEO */
  alt: string;
  /** Desired width */
  width?: number;
  /** Desired height */
  height?: number;
  /** Fill container mode */
  fill?: boolean;
  /** CSS class names */
  className?: string;
  /** Container class names */
  containerClassName?: string;
  /** Image quality (1-100) */
  quality?: number;
  /** Output format */
  format?: "webp" | "avif" | "jpeg" | "png" | "auto";
  /** Loading strategy */
  loading?: "lazy" | "eager";
  /** Object fit style */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /** Object position */
  objectPosition?: string;
  /** Placeholder while loading */
  placeholder?: "blur" | "empty";
  /** Blur data URL for placeholder */
  blurDataURL?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback on error */
  onError?: () => void;
  /** Priority loading (for LCP images) */
  priority?: boolean;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Enable Cloudflare optimization */
  useCloudflare?: boolean;
  /** Cloudflare images domain */
  cdnDomain?: string;
}

/**
 * Generate Cloudflare Images URL with optimizations
 */
function generateCloudflareUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    cdnDomain?: string;
  }
): string {
  // If already a Cloudflare URL, return as-is
  if (src.includes("/cdn-cgi/image/")) {
    return src;
  }

  // If it's an external URL, use the worker endpoint
  if (src.startsWith("http") && !src.includes("vayva.ng")) {
    const params = new URLSearchParams();
    params.set("url", src);
    if (options.width) params.set("w", options.width.toString());
    if (options.height) params.set("h", options.height.toString());
    if (options.quality) params.set("q", options.quality.toString());
    if (options.format && options.format !== "auto") params.set("f", options.format);
    
    const domain = options.cdnDomain || "https://cdn.vayva.ng";
    return `${domain}/cdn/images/?${params.toString()}`;
  }

  // For local images, use Cloudflare's on-the-fly optimization
  const domain = options.cdnDomain || "https://vayva.ng";
  const params: string[] = [];
  
  if (options.width) params.push(`width=${options.width}`);
  if (options.height) params.push(`height=${options.height}`);
  if (options.quality) params.push(`quality=${options.quality}`);
  if (options.format && options.format !== "auto") params.push(`format=${options.format}`);
  
  const paramString = params.length > 0 ? `/${params.join(",")}` : "";
  return `${domain}/cdn-cgi/image${paramString}/${src}`;
}

/**
 * Generate srcset for responsive images
 */
function generateSrcSet(
  src: string,
  widths: number[],
  options: {
    quality?: number;
    format?: string;
    cdnDomain?: string;
  }
): string {
  return widths
    .map((width) => {
      const url = generateCloudflareUrl(src, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Default responsive breakpoints
 */
const DEFAULT_BREAKPOINTS = [640, 750, 828, 1080, 1200, 1920];

/**
 * Optimized Image Component
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  containerClassName = "",
  quality = 80,
  format = "auto",
  loading = "lazy",
  objectFit = "cover",
  objectPosition = "center",
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  priority = false,
  sizes = "100vw",
  useCloudflare = true,
  cdnDomain,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Handle error state
  if (hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${containerClassName}`}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  // Generate optimized URL
  const optimizedSrc = useCloudflare
    ? generateCloudflareUrl(src, { width, height, quality, format, cdnDomain })
    : src;

  // Generate srcset for responsive images
  const _srcSet = useCloudflare && !fill
    ? generateSrcSet(src, DEFAULT_BREAKPOINTS, { quality, format, cdnDomain })
    : undefined;

  // For external images not using Cloudflare, use standard img tag with optimizations
  if (!useCloudflare || src.startsWith("data:")) {
    return (
      <div className={`relative ${containerClassName}`} style={!fill ? { width, height } : undefined}>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          style={{
            objectFit,
            objectPosition,
            width: fill ? "100%" : width,
            height: fill ? "100%" : height,
          }}
        />
        {!isLoaded && placeholder === "blur" && blurDataURL && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-sm"
            style={{ backgroundImage: `url(${blurDataURL})` }}
          />
        )}
      </div>
    );
  }

  // Use Next.js Image with Cloudflare optimization
  return (
    <div className={`relative ${containerClassName}`}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        loading={loading}
        priority={priority}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        style={{ objectFit, objectPosition }}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
      />
      {!isLoaded && placeholder === "blur" && blurDataURL && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm -z-10"
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      )}
    </div>
  );
}

/**
 * Product Image Component
 * Optimized for product thumbnails and galleries
 */
export function ProductImage({
  src,
  alt,
  size = "medium",
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  size?: "small" | "medium" | "large" | "full";
  className?: string;
  priority?: boolean;
}) {
  const sizeMap = {
    small: { width: 150, height: 150 },
    medium: { width: 300, height: 300 },
    large: { width: 600, height: 600 },
    full: { width: 1200, height: 1200 },
  };

  const { width, height } = sizeMap[size];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={85}
      format="webp"
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      className={`rounded-lg ${className}`}
      objectFit="cover"
      sizes={`(max-width: 640px) ${width}px, ${width}px`}
    />
  );
}

/**
 * Hero Image Component
 * Optimized for large banner/hero images (LCP)
 */
export function HeroImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      quality={90}
      format="webp"
      loading="eager"
      priority
      className={className}
      objectFit="cover"
      sizes="100vw"
    />
  );
}

/**
 * Avatar Image Component
 * Optimized for user/merchant avatars
 */
export function AvatarImage({
  src,
  alt,
  size = 48,
  className = "",
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const fallbackSrc = `/api/avatar?size=${size}&name=${encodeURIComponent(alt)}`;
  
  return (
    <OptimizedImage
      src={src || fallbackSrc}
      alt={alt}
      width={size}
      height={size}
      quality={80}
      format="webp"
      className={`rounded-full ${className}`}
      objectFit="cover"
    />
  );
}

export default OptimizedImage;
