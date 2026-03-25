'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ImageScratchProps {
  foregroundSrc: string;
  backgroundSrc: string;
  className?: string;
  width?: number;
  height?: number;
  brushSize?: number;
}

/**
 * Image Scratch - Scratch-off reveal component
 * From Framer University Library
 */
export function ImageScratch({
  foregroundSrc,
  backgroundSrc,
  className = '',
  width = 300,
  height = 200,
  brushSize = 30,
}: ImageScratchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load foreground image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = foregroundSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
    };
  }, [foregroundSrc, width, height]);

  const scratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratched percentage
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const percent = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchedPercent(percent);

    if (percent > 50 && !isRevealed) {
      setIsRevealed(true);
    }
  }, [isScratching, brushSize, width, height, isRevealed]);

  const startScratching = useCallback(() => setIsScratching(true), []);
  const stopScratching = useCallback(() => setIsScratching(false), []);

  const revealAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    setScratchedPercent(100);
    setIsRevealed(true);
  }, [width, height]);

  return (
    <motion.div 
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{ width, height }}
      >
        <img
          src={backgroundSrc}
          alt="Hidden content"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Scratch canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startScratching}
        onMouseMove={scratch}
        onMouseUp={stopScratching}
        onMouseLeave={stopScratching}
        onTouchStart={startScratching}
        onTouchMove={scratch}
        onTouchEnd={stopScratching}
        className="relative z-10 rounded-xl cursor-pointer touch-none"
        style={{ width, height }}
      />

      {/* Progress indicator */}
      <div className="absolute bottom-2 left-2 right-2 z-20">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${scratchedPercent}%` }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.1 }}
          />
        </div>
      </div>

      {/* Reveal button */}
      {!isRevealed && (
        <motion.button
          onClick={revealAll}
          className="absolute top-2 right-2 z-20 px-2 py-1 text-xs bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        >
          Reveal All
        </motion.button>
      )}

      {/* Success message */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-white/90 px-4 py-2 rounded-xl shadow-lg">
            <span className="text-green-600 font-medium">Revealed!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
