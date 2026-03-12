'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface SoulfulFormSubmitProps {
  onSubmit: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
  errorMessage?: string;
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Soulful Form Submit - Animated form submit button with states
 * From Framer University Library
 */
export function SoulfulFormSubmit({
  onSubmit,
  children,
  className = '',
  successMessage = 'Success!',
  errorMessage = 'Something went wrong',
}: SoulfulFormSubmitProps) {
  const [state, setState] = useState<SubmitState>('idle');
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async () => {
    setState('loading');
    try {
      await onSubmit();
      setState('success');
      setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  const buttonContent = {
    idle: children,
    loading: (
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span>Processing...</span>
      </motion.div>
    ),
    success: (
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          />
        </svg>
        <span>{successMessage}</span>
      </motion.div>
    ),
    error: (
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>{errorMessage}</span>
      </motion.div>
    ),
  };

  const buttonStyles = {
    idle: 'bg-blue-600 hover:bg-blue-700',
    loading: 'bg-blue-500 cursor-wait',
    success: 'bg-green-600',
    error: 'bg-red-600',
  };

  return (
    <motion.button
      type="button"
      onClick={handleSubmit}
      disabled={state === 'loading'}
      className={`relative px-6 py-3 font-medium text-white rounded-lg overflow-hidden transition-colors ${buttonStyles[state]} ${className}`}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      layout
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          {buttonContent[state]}
        </motion.div>
      </AnimatePresence>
      
      {/* Ripple effect on submit */}
      {state === 'success' && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  );
}
