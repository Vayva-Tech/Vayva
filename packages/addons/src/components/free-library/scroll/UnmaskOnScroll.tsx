'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface UnmaskOnScrollProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

/**
 * Unmask On Scroll - Reveals content as user scrolls
 * From Framer University Library
 */
export function UnmaskOnScroll({ 
  children, 
  className = '',
  direction = 'up',
  delay = 0 
}: UnmaskOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion();

  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 100, opacity: 0 };
      case 'down': return { y: -100, opacity: 0 };
      case 'left': return { x: 100, opacity: 0 };
      case 'right': return { x: -100, opacity: 0 };
      default: return { y: 100, opacity: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialPosition()}
      animate={isInView ? { x: 0, y: 0, opacity: 1 } : getInitialPosition()}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.8,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
