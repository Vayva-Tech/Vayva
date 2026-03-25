'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface XRayHoverProps {
  src: string;
  xraySrc: string;
  alt: string;
  className?: string;
}

/**
 * X-Ray Hover Effect - See through to another layer
 * From Framer University Library
 */
export function XRayHover({ src, xraySrc, alt, className = '' }: XRayHoverProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Base Image */}
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      
      {/* X-Ray Layer */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        style={{
          backgroundImage: `url(${xraySrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          clipPath: isHovered 
            ? `circle(80px at ${mousePosition.x}% ${mousePosition.y}%)`
            : 'circle(0% at 50% 50%)',
          transition: prefersReducedMotion ? undefined : 'clip-path 0.1s ease-out',
        }}
      />
      
      {/* X-Ray Circle Border */}
      <motion.div
        className="absolute pointer-events-none border-2 border-white/50 rounded-full"
        style={{
          width: 160,
          height: 160,
          left: `calc(${mousePosition.x}% - 80px)`,
          top: `calc(${mousePosition.y}% - 80px)`,
          boxShadow: '0 0 20px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.2)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      />
    </div>
  );
}
