'use client';

/**
 * CountdownTimer Widget
 *
 * Displays a real-time countdown to an event date/time.
 * Used for events, ticket sales deadlines, and campaign endings.
 */

import { useState, useEffect, useCallback } from 'react';
import { BaseWidget } from '@vayva/industry-core';
import type { WidgetProps, WidgetDefinition } from '@vayva/industry-core';

export interface CountdownTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export interface CountdownTimerWidgetProps {
  widget: WidgetDefinition;
  data?: any;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
  targetDate: Date | string;
  eventName?: string;
  onComplete?: () => void;
  showSeconds?: boolean;
  size?: 'small' | 'medium' | 'large';
}

function calculateTimeLeft(targetDate: Date): CountdownTimeLeft {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

function formatNumber(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * CountdownTimerWidget Component
 */
export function CountdownTimerWidget({
  widget,
  isLoading,
  error,
  targetDate,
  eventName,
  onComplete,
  showSeconds = true,
  size = 'medium',
}: CountdownTimerWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownTimeLeft>(() =>
    calculateTimeLeft(new Date(targetDate))
  );

  const updateCountdown = useCallback(() => {
    const newTimeLeft = calculateTimeLeft(new Date(targetDate));
    setTimeLeft(newTimeLeft);

    if (newTimeLeft.isExpired && onComplete) {
      onComplete();
    }
  }, [targetDate, onComplete]);

  useEffect(() => {
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [updateCountdown]);

  const getTimeBlocks = () => {
    const blocks = [
      { value: timeLeft.days, label: 'Days' },
      { value: timeLeft.hours, label: 'Hours' },
      { value: timeLeft.minutes, label: 'Minutes' },
      { value: timeLeft.seconds, label: 'Seconds' },
    ];

    return showSeconds ? blocks : blocks.slice(0, 3);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'grid-cols-3 gap-2 text-sm';
      case 'large':
        return 'grid-cols-4 gap-6 text-2xl';
      default:
        return 'grid-cols-4 gap-4 text-lg';
    }
  };

  const getBlockClasses = () => {
    const base = 'flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200';
    
    switch (size) {
      case 'small':
        return `${base} min-w-[60px]`;
      case 'large':
        return `${base} min-w-[120px] p-6`;
      default:
        return `${base} min-w-[80px] p-4`;
    }
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      className="countdown-timer-widget"
    >
      <div className="w-full">
        {eventName && (
          <p className="text-center text-sm font-medium text-gray-700 mb-4">
            {eventName}
          </p>
        )}

        {timeLeft.isExpired ? (
          <div className="text-center py-8">
            <div className="text-3xl font-bold text-red-600">
              Event Started!
            </div>
            <p className="text-gray-500 mt-2">The countdown has ended</p>
          </div>
        ) : (
          <div className={`grid ${getSizeClasses()}`}>
            {getTimeBlocks().map(({ value, label }) => (
              <div key={label} className={getBlockClasses()}>
                <span className="font-bold tabular-nums">
                  {formatNumber(value)}
                </span>
                <span className="text-xs uppercase tracking-wide text-gray-600 mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Progress indicator (optional) */}
        {!timeLeft.isExpired && size !== 'small' && (
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (timeLeft.seconds / 60) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

CountdownTimerWidget.displayName = 'CountdownTimerWidget';

export default CountdownTimerWidget;
