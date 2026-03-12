'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface MaskRevealHoverProps {
  src: string;
  alt: string;
  revealSrc?: string;
  className?: string;
}

/**
 * Mask Reveal Hover Effect - Crazy hover mask reveal
 * From Framer University Library
 */
export function MaskRevealHover({ 
  src, 
  alt, 
  revealSrc,
  className = '' 
}: MaskRevealHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`relative overflow-hidden cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Base Image */}
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-cover"
      />
      
      {/* Reveal Overlay */}
      <motion.div
        className="absolute inset-0"
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={{ 
          clipPath: isHovered 
            ? 'circle(100% at 50% 50%)' 
            : 'circle(0% at 50% 50%)' 
        }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 0.5,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <img 
          src={revealSrc || src} 
          alt={`${alt} - revealed`}
          className="w-full h-full object-cover"
          style={{ filter: 'saturate(1.2) contrast(1.1)' }}
        />
      </motion.div>
      
      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
