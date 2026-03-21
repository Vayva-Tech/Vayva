// @ts-nocheck
'use client';

import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import React from 'react';

interface ImageProps extends Omit<NextImageProps, 'loading'> {
  /**
   * Image optimization quality (1-100)
   * @default 75
   */
  quality?: number;
  
  /**
   * Loading strategy
   * @default 'lazy'
   */
  loadingStrategy?: 'lazy' | 'eager' | 'auto';
  
  /**
   * Placeholder style
   * @default 'blur'
   */
  placeholder?: 'blur' | 'empty';
  
  /**
   * Blur data URL for placeholder
   */
  blurDataURL?: string;
}

/**
 * Optimized image component using Next.js Image with smart defaults
 */
export function Image({
  src,
  alt,
  width,
  height,
  fill,
  quality = 75,
  loadingStrategy = 'lazy',
  placeholder = 'blur',
  blurDataURL,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority,
  ...props
}: ImageProps) {
  // Convert loading strategy to Next.js loading prop
  const loading = priority ? 'eager' : loadingStrategy;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        quality={quality}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='}
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-300 hover:scale-105"
        {...props}
      />
    </div>
  );
}

/**
 * Responsive image with art direction
 */
export function ResponsiveImage({
  src,
  alt,
  sources,
  defaultSize,
  aspectRatio = '16/9',
  className = '',
}: {
  src: string;
  alt: string;
  sources?: Array<{ media: string; src: string }>;
  defaultSize?: string;
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div 
      className={`relative w-full ${className}`}
      style={{ aspectRatio }}
    >
      <picture>
        {sources?.map((source, index) => (
          <source
            key={index}
            media={source.media}
            srcSet={source.src}
          />
        ))}
        <NextImage
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={defaultSize || '(max-width: 768px) 100vw, 50vw'}
          quality={80}
        />
      </picture>
    </div>
  );
}

/**
 * Optimized avatar image component
 */
export function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
    xl: { width: 80, height: 80 },
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={sizeMap[size].width}
      height={sizeMap[size].height}
      className={`rounded-full border-2 border-gray-100 ${className}`}
      quality={90}
      loadingStrategy="eager"
      priority
    />
  );
}
