"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  blurDataURL?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component with:
 * - Lazy loading via Intersection Observer
 * - WebP format with fallback
 * - Blur placeholder effect
 * - Responsive srcset
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  blurDataURL,
  priority = false,
  loading = "lazy",
  objectFit = "cover",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(priority);
  const [imageSrc, setImageSrc] = useState<string>(blurDataURL || "");
  const [supportsWebP, setSupportsWebP] = useState(true);

  // Check WebP support
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkWebP = async () => {
      const webpSupported = document.createElement("canvas")
        .toDataURL("image/webp")
        .indexOf("data:image/webp") === 0;
      setSupportsWebP(webpSupported);
    };
    checkWebP();
  }, []);

  // Generate src with WebP if supported
  const optimizedSrc = useMemo(() => {
    if (supportsWebP && !src.includes(".webp")) {
      // Add query param for WebP conversion
      const separator = src.includes("?") ? "&" : "?";
      return `${src}${separator}format=webp`;
    }
    return src;
  }, [src, supportsWebP]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === "eager") {
      queueMicrotask(() => setImageSrc(optimizedSrc));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            setImageSrc(optimizedSrc);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    const container = document.getElementById(`img-container-${src}`);
    if (container) {
      observer.observe(container);
    }

    return () => observer.disconnect();
  }, [src, priority, loading, optimizedSrc]);

  // Load actual image when in viewport
  useEffect(() => {
    if (!isInViewport || imageSrc === optimizedSrc) return;

    const img = new Image();
    img.src = optimizedSrc;
    img.onload = () => {
      setImageSrc(optimizedSrc);
    };
    img.onerror = () => {
      // Fallback to original src
      setImageSrc(src);
    };
  }, [isInViewport, optimizedSrc, src, imageSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      id={`img-container-${src}`}
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
      style={{
        width: width || "100%",
        height: height || "100%",
      }}
    >
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl scale-110 transition-opacity duration-500"
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      )}

      {/* Loading shimmer */}
      {!isLoaded && !blurDataURL && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* Main image */}
      <img
        src={imageSrc || src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "w-full h-full transition-all duration-500",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
          `object-${objectFit}`,
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        decoding={priority ? "sync" : "async"}
      />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

/**
 * Generate a blur data URL from an image URL
 * This should be called server-side or during build
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  // Generate a tiny SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Hook to detect if browser supports WebP
 */
export function useWebPSupport(): boolean {
  const [supportsWebP, setSupportsWebP] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkWebP = async () => {
      const webpSupported = document.createElement("canvas")
        .toDataURL("image/webp")
        .indexOf("data:image/webp") === 0;
      setSupportsWebP(webpSupported);
    };

    checkWebP();
  }, []);

  return supportsWebP;
}
