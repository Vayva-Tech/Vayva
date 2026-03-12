'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface DropdownItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface GooeyDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

/**
 * Gooey Dropdown - Fluid dropdown with gooey animation
 * From Framer University Library
 */
export function GooeyDropdown({ trigger, items, className = '' }: GooeyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {trigger}
        <motion.svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Gooey container with SVG filter */}
            <div className="absolute top-full left-0 mt-2 z-50" style={{ filter: 'url(#gooey)' }}>
              <svg className="absolute" style={{ visibility: 'hidden' }}>
                <defs>
                  <filter id="gooey">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix
                      in="blur"
                      mode="matrix"
                      values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                      result="goo"
                    />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                  </filter>
                </defs>
              </svg>

              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ 
                  duration: prefersReducedMotion ? 0 : 0.4,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[200px]"
              >
                {items.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: prefersReducedMotion ? 0 : index * 0.05,
                      duration: prefersReducedMotion ? 0 : 0.3 
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors first:pt-4 last:pb-4"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <span className="text-gray-500">{item.icon}</span>}
                    <span className="text-gray-700 font-medium">{item.label}</span>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
