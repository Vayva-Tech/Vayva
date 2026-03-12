'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface WoodToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  label?: string;
}

/**
 * Wood Toggle - Styled toggle switch with wood texture aesthetic
 * From Framer University Library
 */
export function WoodToggle({ 
  checked: controlledChecked, 
  onChange, 
  className = '',
  label 
}: WoodToggleProps) {
  const [internalChecked, setInternalChecked] = useState(false);
  const isChecked = controlledChecked !== undefined ? controlledChecked : internalChecked;
  const prefersReducedMotion = useReducedMotion();

  const handleToggle = () => {
    const newValue = !isChecked;
    if (controlledChecked === undefined) {
      setInternalChecked(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        {/* Track */}
        <motion.div
          className="w-14 h-8 rounded-full relative overflow-hidden"
          style={{
            background: isChecked
              ? 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)'
              : 'linear-gradient(135deg, #D2B48C 0%, #DEB887 50%, #D2B48C 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          }}
          animate={{
            background: isChecked
              ? 'linear-gradient(135deg, #228B22 0%, #32CD32 50%, #228B22 100%)'
              : 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        >
          {/* Wood grain texture overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(0,0,0,0.1) 2px,
                  rgba(0,0,0,0.1) 4px
                )
              `,
            }}
          />
          
          {/* Thumb */}
          <motion.div
            className="absolute top-1 w-6 h-6 rounded-full shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #F4A460 0%, #DEB887 50%, #D2691E 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
              left: isChecked ? 'calc(100% - 28px)' : '4px',
            }}
            animate={{
              left: isChecked ? 'calc(100% - 28px)' : '4px',
              rotate: isChecked ? 360 : 0,
            }}
            transition={{ 
              type: prefersReducedMotion ? 'tween' : 'spring',
              stiffness: 500,
              damping: 30,
            }}
          >
            {/* Thumb wood grain */}
            <div 
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 1px,
                    rgba(139,69,19,0.3) 1px,
                    rgba(139,69,19,0.3) 2px
                  )
                `,
              }}
            />
          </motion.div>
        </motion.div>
        
        {/* Hidden checkbox */}
        <input
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleToggle}
        />
      </div>
      
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  );
}
