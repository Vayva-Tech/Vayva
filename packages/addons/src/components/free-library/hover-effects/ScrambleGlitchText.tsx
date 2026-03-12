'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ScrambleGlitchTextProps {
  text: string;
  className?: string;
  scrambleChars?: string;
}

const DEFAULT_SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#________';

/**
 * Scramble Glitch Text - Text that scrambles on hover
 * From Framer University Library
 */
export function ScrambleGlitchText({ 
  text, 
  className = '',
  scrambleChars = DEFAULT_SCRAMBLE_CHARS 
}: ScrambleGlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const scramble = useCallback(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text, scrambleChars, prefersReducedMotion]);

  useEffect(() => {
    if (isHovered) {
      const cleanup = scramble();
      return cleanup;
    } else {
      setDisplayText(text);
    }
  }, [isHovered, scramble, text]);

  return (
    <motion.span
      className={`inline-block font-mono cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
    >
      {displayText}
      {isHovered && (
        <motion.span
          className="inline-block ml-1 w-0.5 h-5 bg-current align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.span>
  );
}
