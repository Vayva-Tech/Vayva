'use client';

import { useMemo } from 'react';

type AnimationSpeed = 'slow' | 'normal' | 'fast';

interface SpeedConfig {
  duration: number;
  spring: {
    stiffness: number;
    damping: number;
    mass: number;
  };
}

const SPEED_CONFIGS: Record<AnimationSpeed, SpeedConfig> = {
  slow: {
    duration: 0.6,
    spring: { stiffness: 100, damping: 20, mass: 1.2 },
  },
  normal: {
    duration: 0.4,
    spring: { stiffness: 200, damping: 20, mass: 1 },
  },
  fast: {
    duration: 0.2,
    spring: { stiffness: 400, damping: 25, mass: 0.8 },
  },
};

/**
 * Hook to get animation timing based on speed setting
 */
export function useAnimationSpeed(speed: AnimationSpeed = 'normal'): SpeedConfig {
  return useMemo(() => SPEED_CONFIGS[speed], [speed]);
}
