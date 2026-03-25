'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface KineticGridProps {
  children: React.ReactNode[];
  className?: string;
  columns?: number;
  staggerDelay?: number;
}

/**
 * Kinetic Grid - Grid with staggered entrance animation
 * From Framer University Library
 */
export function KineticGrid({ 
  children, 
  className = '',
  columns = 3,
  staggerDelay = 0.1
}: KineticGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div 
      ref={ref}
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.5,
            delay: prefersReducedMotion ? 0 : index * staggerDelay,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
