'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface PixelLoadEffectProps {
  src: string;
  alt: string;
  className?: string;
  pixelSize?: number;
}

/**
 * Pixel Load Effect - Image loads with pixelated transition
 * From Framer University Library
 */
export function PixelLoadEffect({ 
  src, 
  alt, 
  className = '',
  pixelSize = 20
}: PixelLoadEffectProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPixelated, setShowPixelated] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
      // Delay the transition to pixelated for effect
      setTimeout(() => setShowPixelated(false), 100);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pixelated version */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ filter: `blur(${pixelSize}px)` }}
        animate={{ 
          filter: showPixelated && !prefersReducedMotion ? `blur(${pixelSize}px)` : 'blur(0px)',
          scale: showPixelated && !prefersReducedMotion ? 1.05 : 1,
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: 'easeOut' }}
        style={{
          imageRendering: 'pixelated',
        }}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Pixel grid overlay during transition */}
      {showPixelated && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${pixelSize}px ${pixelSize}px`,
          }}
        />
      )}
    </div>
  );
}
