'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface RotationButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * Rotation Button - Button with rotation hover effect
 * From Framer University Library
 */
export function RotationButton({ 
  children, 
  onClick, 
  className = '',
  variant = 'primary' 
}: RotationButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const baseStyles = 'relative px-6 py-3 font-medium rounded-lg overflow-hidden transition-colors';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900',
    outline: 'border-2 border-current text-blue-600 hover:bg-blue-50',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
    >
      {/* Background rotation effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
        initial={{ rotate: 0, scale: 1.5, x: '-100%' }}
        animate={{ 
          rotate: isHovered ? 180 : 0,
          x: isHovered ? '100%' : '-100%'
        }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : 0.6,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Content */}
      <motion.span
        className="relative z-10 flex items-center justify-center gap-2"
        animate={{ 
          y: isHovered ? -2 : 0,
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
        {children}
      </motion.span>
      
      {/* Corner accent */}
      <motion.div
        className="absolute bottom-0 right-0 w-8 h-8 bg-white/10"
        initial={{ rotate: 0 }}
        animate={{ rotate: isHovered ? 90 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        style={{ transformOrigin: 'bottom right' }}
      />
    </motion.button>
  );
}
