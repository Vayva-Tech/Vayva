'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ImageSequenceScrollProps {
  images: string[];
  className?: string;
  height?: string;
}

/**
 * Image Sequence Scroll - Animates through image sequence on scroll
 * From Framer University Library
 */
export function ImageSequenceScroll({ 
  images, 
  className = '',
  height = '100vh'
}: ImageSequenceScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Calculate which image to show based on scroll progress
  const imageIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, images.length - 1]
  );

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {images.map((src, index) => (
          <motion.img
            key={src}
            src={src}
            alt={`Frame ${index + 1}`}
            className="absolute w-full h-full object-cover"
            style={{
              opacity: prefersReducedMotion 
                ? index === 0 ? 1 : 0 
                : useTransform(
                    imageIndex,
                    [index - 0.5, index, index + 0.5],
                    [0, 1, 0]
                  ),
            }}
          />
        ))}
        
        {/* Progress indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-white/50"
              style={{
                backgroundColor: prefersReducedMotion 
                  ? index === 0 ? 'white' : 'rgba(255,255,255,0.5)'
                  : useTransform(
                      imageIndex,
                      [index - 0.5, index, index + 0.5],
                      ['rgba(255,255,255,0.5)', 'white', 'rgba(255,255,255,0.5)']
                    ),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
