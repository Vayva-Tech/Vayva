'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SwipeableProps, useSwipeable } from 'react-swipeable';

interface MobileDashboardProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileDashboard({ children, className }: MobileDashboardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pull-to-refresh
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY && window.scrollY === 0) {
      setTouchEndY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartY || !touchEndY) return;
    
    const diff = touchEndY - touchStartY;
    if (diff > 100) {
      // Pull down refresh
      triggerRefresh();
    }
    
    setTouchStartY(0);
    setTouchEndY(0);
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  // Swipe gestures for tab navigation
  const swipeProps = useSwipeable({
    onSwipedLeft: () => setActiveTab(prev => Math.min(prev + 1, 4)),
    onSwipedRight: () => setActiveTab(prev => Math.max(prev - 1, 0)),
    delta: 50,
  });

  return (
    <div 
      className={cn('mobile-dashboard', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...swipeProps}
    >
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 bg-background/80 backdrop-blur">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}

      {/* Mobile Tab Bar */}
      <MobileTabBar activeTab={activeTab} onChange={setActiveTab} />

      {/* Content Area */}
      <div className="pb-20">
        {React.Children.map(children, (child, index) => (
          <div
            className={cn(
              'transition-opacity duration-300',
              index === activeTab ? 'block' : 'hidden'
            )}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Swipe Hint */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-50 pointer-events-none">
        ← Swipe →
      </div>
    </div>
  );
}

interface MobileTabBarProps {
  activeTab: number;
  onChange: (index: number) => void;
}

function MobileTabBar({ activeTab, onChange }: MobileTabBarProps) {
  const tabs = [
    { icon: '📊', label: 'Overview' },
    { icon: '📦', label: 'Inventory' },
    { icon: '🛒', label: 'Orders' },
    { icon: '👥', label: 'Customers' },
    { icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => onChange(index)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[64px]',
              activeTab === index
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Mobile-optimized KPI Card
interface MobileKPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function MobileKPICard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  className,
}: MobileKPICardProps) {
  return (
    <div className={cn('p-4 border rounded-lg bg-card shadow-sm', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        {change !== undefined && (
          <div className={cn(
            'text-xs font-medium',
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {Math.abs(change * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized List Item
interface MobileListItemProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileListItem({
  title,
  subtitle,
  value,
  icon,
  onClick,
  className,
}: MobileListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 border-b last:border-0 active:bg-accent transition-colors cursor-pointer',
        className
      )}
    >
      {icon && <div className="text-muted-foreground">{icon}</div>}
      
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{title}</div>
        {subtitle && <div className="text-sm text-muted-foreground truncate">{subtitle}</div>}
      </div>
      
      {value && (
        <div className="text-sm font-semibold whitespace-nowrap">{value}</div>
      )}
      
      <svg
        className="w-5 h-5 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

// Mobile-specific hook for responsive behavior
export function useMobileDashboard(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return { isMobile };
}

// Safe area component for notched devices
export function SafeArea({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('safe-area-inset', className)}>
      {children}
    </div>
  );
}
