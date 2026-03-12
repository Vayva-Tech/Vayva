'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface IconMorpherProps {
  className?: string;
  size?: number;
}

/**
 * Icon Morpher - Morphs between different icons on hover
 * From Framer University Library
 */
export function IconMorpher({ className = '', size = 24 }: IconMorpherProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const pathVariants = {
    menu: {
      d: [
        'M3 6h18M3 12h18M3 18h18', // Hamburger
      ],
    },
    close: {
      d: [
        'M6 6l12 12M6 18L18 6', // X
      ],
    },
  };

  return (
    <motion.button
      className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsHovered(!isHovered)}
      whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Top line */}
        <motion.path
          d="M3 6h18"
          animate={{
            d: isHovered ? 'M6 6l12 12' : 'M3 6h18',
            rotate: isHovered ? 0 : 0,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        />
        
        {/* Middle line */}
        <motion.path
          d="M3 12h18"
          animate={{
            opacity: isHovered ? 0 : 1,
            scaleX: isHovered ? 0 : 1,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          style={{ originX: 0.5 }}
        />
        
        {/* Bottom line */}
        <motion.path
          d="M3 18h18"
          animate={{
            d: isHovered ? 'M6 18L18 6' : 'M3 18h18',
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        />
      </svg>
    </motion.button>
  );
}
