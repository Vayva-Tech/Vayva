'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ScribblePadProps {
  className?: string;
  width?: number;
  height?: number;
  onSave?: (dataUrl: string) => void;
}

/**
 * Scribble Pad - Drawing component for user interaction
 * From Framer University Library
 */
export function ScribblePad({ 
  className = '', 
  width = 300, 
  height = 200,
  onSave 
}: ScribblePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawing(true);
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }, []);

  const save = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawing) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave?.(dataUrl);
  }, [hasDrawing, onSave]);

  return (
    <motion.div 
      className={`inline-block ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      <div 
        className="relative bg-white rounded-xl border-2 border-dashed border-gray-300 overflow-hidden cursor-crosshair"
        style={{ width, height }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none"
        />
        
        {!hasDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm">Draw here...</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-3">
        <motion.button
          onClick={clear}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          disabled={!hasDrawing}
        >
          Clear
        </motion.button>
        {onSave && (
          <motion.button
            onClick={save}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            disabled={!hasDrawing}
          >
            Save
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
