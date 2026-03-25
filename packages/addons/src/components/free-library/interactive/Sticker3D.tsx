'use client';

import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Sticker3DProps {
  src: string;
  alt: string;
  className?: string;
  size?: number;
}

/**
 * 3D Sticker - Draggable 3D sticker with physics
 * From Framer University Library
 */
export function Sticker3D({ src, alt, className = '', size = 120 }: Sticker3DProps) {
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Calculate rotation based on position
  const rotateX = useTransform(springY, [-100, 100], [15, -15]);
  const rotateY = useTransform(springX, [-100, 100], [-15, 15]);
  const shineOpacity = useTransform(rotateY, [-15, 15], [0.1, 0.4]);

  return (
    <motion.div
      className={`relative cursor-grab active:cursor-grabbing ${className}`}
      style={{
        width: size,
        height: size,
        perspective: 1000,
      }}
      drag={!prefersReducedMotion}
      dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
    >
      <motion.div
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
        style={{
          x: springX,
          y: springY,
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          boxShadow: isDragging
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"
          style={{
            opacity: prefersReducedMotion ? 0.2 : shineOpacity,
          }}
        />
      </motion.div>
      
      {/* Drop shadow */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 rounded-full blur-xl"
        animate={{
          scale: isDragging ? 1.2 : 1,
          opacity: isDragging ? 0.4 : 0.2,
        }}
      />
    </motion.div>
  );
}
