import React from 'react';

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  hoverEffect?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
}) => {
  const baseStyles = 'backdrop-blur-[20px] rounded-2xl transition-all duration-300';
  
  const variantStyles = {
    default: 'bg-white/3 border border-white/8',
    elevated: 'bg-white/5 border border-white/10 shadow-lg',
    interactive: `bg-white/3 border border-white/8 ${hoverEffect ? 'hover:bg-white/6 hover:border-rose-400/30 hover:shadow-xl hover:shadow-rose-400/10' : ''}`,
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default GlassPanel;
