// @ts-nocheck
'use client';

import React from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

interface IconProps {
  name: string;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
  color?: string;
}

/**
 * Generic Icon component that renders Phosphor icons by name.
 */
export function Icon({ name, size = 24, weight = 'regular', className, color }: IconProps) {
  const IconComponent = (PhosphorIcons as any)[name];

  if (!IconComponent) {
    return <span className={className} style={{ width: size, height: size, display: 'inline-block' }} />;
  }

  return <IconComponent size={size} weight={weight} className={className} color={color} />;
}

export default Icon;
