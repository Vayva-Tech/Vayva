'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface NavItem {
  label: string;
  href: string;
}

interface NavItemSelectorProps {
  items: NavItem[];
  activeHref?: string;
  className?: string;
}

/**
 * Nav Item Selector - Unusual navigation item selector with sliding indicator
 * From Framer University Library
 */
export function NavItemSelector({ items, activeHref, className = '' }: NavItemSelectorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(
    items.findIndex(item => item.href === activeHref) || 0
  );
  const prefersReducedMotion = useReducedMotion();

  return (
    <nav className={`relative ${className}`}>
      <ul className="flex items-center gap-1 relative">
        {items.map((item, index) => (
          <li key={item.href}>
            <motion.a
              href={item.href}
              className="relative px-4 py-2 text-sm font-medium transition-colors block"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(index)}
              animate={{
                color: activeIndex === index ? '#3b82f6' : hoveredIndex === index ? '#1f2937' : '#6b7280',
              }}
            >
              {item.label}
            </motion.a>
          </li>
        ))}
        
        {/* Sliding indicator */}
        <motion.div
          className="absolute bottom-0 h-0.5 bg-blue-500 rounded-full"
          layoutId="nav-indicator"
          initial={false}
          animate={{
            width: items[hoveredIndex ?? activeIndex] ? 'calc(100% / ' + items.length + ' - 8px)' : 0,
            x: (hoveredIndex ?? activeIndex) * (100 / items.length) + '%',
            left: 4,
          }}
          transition={{ 
            type: prefersReducedMotion ? 'tween' : 'spring',
            stiffness: 500,
            damping: 30 
          }}
          style={{
            width: items[hoveredIndex ?? activeIndex] ? undefined : 0,
          }}
        />
      </ul>
      
      {/* Background highlight */}
      <motion.div
        className="absolute inset-0 bg-gray-100 rounded-lg -z-10"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: hoveredIndex !== null ? 1 : 0,
          x: hoveredIndex !== null ? hoveredIndex * (100 / items.length) + '%' : 0,
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        style={{
          width: `${100 / items.length}%`,
        }}
      />
    </nav>
  );
}
