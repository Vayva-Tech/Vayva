'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ImageSequenceScrollProps {
  images: string[];
  className?: string;
  height?: string;
}

function SequenceFrame({
  src,
  index,
  imageIndex,
  prefersReducedMotion,
}: {
  src: string;
  index: number;
  imageIndex: MotionValue<number>;
  prefersReducedMotion: boolean;
}) {
  const opacity = useTransform(
    imageIndex,
    [index - 0.5, index, index + 0.5],
    [0, 1, 0]
  );

  return (
    <motion.img
      src={src}
      alt={`Frame ${index + 1}`}
      className="absolute w-full h-full object-cover"
      style={{
        opacity: prefersReducedMotion ? (index === 0 ? 1 : 0) : opacity,
      }}
    />
  );
}

function SequenceDot({
  index,
  imageIndex,
  prefersReducedMotion,
}: {
  index: number;
  imageIndex: MotionValue<number>;
  prefersReducedMotion: boolean;
}) {
  const backgroundColor = useTransform(
    imageIndex,
    [index - 0.5, index, index + 0.5],
    ['rgba(255,255,255,0.5)', 'white', 'rgba(255,255,255,0.5)']
  );

  return (
    <motion.div
      className="w-2 h-2 rounded-full bg-white/50"
      style={{
        backgroundColor: prefersReducedMotion
          ? index === 0
            ? 'white'
            : 'rgba(255,255,255,0.5)'
          : backgroundColor,
      }}
    />
  );
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

  const imageIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, Math.max(0, images.length - 1)]
  );

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {images.map((src, index) => (
          <SequenceFrame
            key={src}
            src={src}
            index={index}
            imageIndex={imageIndex}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <SequenceDot
              key={index}
              index={index}
              imageIndex={imageIndex}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
