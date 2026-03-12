/**
 * Dribbble-Inspired Design System
 * Premium, illustrative UI components with smooth animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { IndustrySlug } from '@/lib/templates/types';

// Theme-based color palettes inspired by Dribbble trends
export const THEME_COLORS = {
  fashion: {
    primary: '#FF6B9D',      // Pink/Rose gold
    secondary: '#4A90E2',    // Blue accent
    accent: '#F5A623',       // Gold
    background: '#FFF5F7',   // Light pink
    text: '#333333'
  },
  retail: {
    primary: '#2ECC71',      // Emerald green
    secondary: '#3498DB',    // Sky blue
    accent: '#F39C12',       // Orange
    background: '#F8FFF8',   // Light mint
    text: '#2C3E50'
  },
  food: {
    primary: '#E74C3C',      // Red
    secondary: '#F39C12',    // Orange
    accent: '#2ECC71',       // Green
    background: '#FFF9F9',   // Light red
    text: '#2C3E50'
  },
  beauty: {
    primary: '#9B59B6',      // Purple
    secondary: '#E91E63',    // Pink
    accent: '#FFC107',       // Yellow
    background: '#FCF7FF',   // Light purple
    text: '#34495E'
  },
  automotive: {
    primary: '#34495E',      // Dark blue-gray
    secondary: '#E74C3C',    // Red
    accent: '#F1C40F',       // Yellow
    background: '#F8F9FA',   // Light gray
    text: '#2C3E50'
  },
  real_estate: {
    primary: '#2980B9',      // Blue
    secondary: '#8E44AD',    // Purple
    accent: '#1ABC9C',       // Teal
    background: '#F5F9FF',   // Light blue
    text: '#2C3E50'
  },
  healthcare: {
    primary: '#1ABC9C',      // Teal
    secondary: '#3498DB',    // Blue
    accent: '#E74C3C',       // Red (emergency)
    background: '#F0FBFA',   // Light teal
    text: '#2C3E50'
  },
  legal: {
    primary: '#2C3E50',      // Dark gray
    secondary: '#3498DB',    // Blue
    accent: '#F39C12',       // Gold
    background: '#F8F9FA',   // Light gray
    text: '#2C3E50'
  },
  travel: {
    primary: '#3498DB',      // Blue
    secondary: '#2ECC71',    // Green
    accent: '#F1C40F',       // Yellow
    background: '#F0F8FF',   // Light sky
    text: '#2C3E50'
  },
  education: {
    primary: '#9B59B6',      // Purple
    secondary: '#3498DB',    // Blue
    accent: '#2ECC71',       // Green
    background: '#F9F3FF',   // Light purple
    text: '#2C3E50'
  },
  professional: {
    primary: '#34495E',      // Charcoal
    secondary: '#2980B9',    // Blue
    accent: '#1ABC9C',       // Teal
    background: '#F8F9FA',   // Light gray
    text: '#2C3E50'
  },
  creative: {
    primary: '#E91E63',      // Hot pink
    secondary: '#9C27B0',    // Purple
    accent: '#FFC107',       // Yellow
    background: '#FFF5F7',   // Light pink
    text: '#2C3E50'
  },
  // Default fallback
  default: {
    primary: '#3B82F6',      // Blue
    secondary: '#10B981',    // Green
    accent: '#F59E0B',       // Amber
    background: '#F9FAFB',   // Light gray
    text: '#1F2937'
  }
} as const;

// Get theme colors for an industry
export function getThemeColors(industry: IndustrySlug | string) {
  const safeIndustry = industry.replace(/[-_]/g, '') as keyof typeof THEME_COLORS;
  return THEME_COLORS[safeIndustry] || THEME_COLORS.default;
}

// Smooth animation variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 }
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }
};

// Illustrative card component with theme integration
interface ThemedCardProps {
  children: React.ReactNode;
  industry: IndustrySlug | string;
  className?: string;
  animate?: boolean;
}

export function ThemedCard({ 
  children, 
  industry, 
  className = '',
  animate = true 
}: ThemedCardProps) {
  const colors = getThemeColors(industry);
  
  return (
    <motion.div
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}
      style={{
        borderColor: `${colors.primary}20`,
        backgroundColor: colors.background,
      }}
      variants={animate ? ANIMATION_VARIANTS.fadeIn : undefined}
      initial={animate ? "initial" : false}
      animate={animate ? "animate" : false}
      whileHover={{ 
        y: -4,
        boxShadow: `0 20px 25px -5px ${colors.primary}20, 0 10px 10px -5px ${colors.primary}10`,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
}

// Gradient header component
interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  industry: IndustrySlug | string;
  icon?: React.ReactNode;
}

export function GradientHeader({ 
  title, 
  subtitle, 
  industry, 
  icon 
}: GradientHeaderProps) {
  const colors = getThemeColors(industry);
  
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-8 mb-8"
      style={{
        background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`,
      }}
      variants={ANIMATION_VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-2">
          {icon && (
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              {icon}
            </div>
          )}
          <div>
            <h1 
              className="text-3xl font-bold"
              style={{ color: colors.primary }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
        style={{ 
          background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`,
          transform: 'translate(40%, -40%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10"
        style={{ 
          background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
          transform: 'translate(-40%, 40%)'
        }}
      />
    </motion.div>
  );
}

// Animated metric card
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  industry: IndustrySlug | string;
  icon?: React.ReactNode;
}

export function AnimatedMetricCard({ 
  title, 
  value, 
  change, 
  industry, 
  icon 
}: MetricCardProps) {
  const colors = getThemeColors(industry);
  
  return (
    <ThemedCard industry={industry} className="h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <motion.p 
            className="text-2xl font-bold"
            style={{ color: colors.primary }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {value}
          </motion.p>
          {change !== undefined && (
            <motion.div 
              className="flex items-center gap-1 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span 
                className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </motion.div>
          )}
        </div>
        {icon && (
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            {icon}
          </div>
        )}
      </div>
    </ThemedCard>
  );
}