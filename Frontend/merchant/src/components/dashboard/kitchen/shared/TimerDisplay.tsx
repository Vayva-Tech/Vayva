'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  startTime: Date;
  targetTime: Date;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

/**
 * TimerDisplay Component
 * 
 * Shows elapsed time with color-coded urgency levels
 */
export function TimerDisplay({
  startTime,
  targetTime,
  size = 'medium',
  showIcon = true,
}: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState(0);
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical' | 'overdue'>('normal');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const start = new Date(startTime).getTime();
      const target = new Date(targetTime).getTime();
      
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const remainingSeconds = (target - now) / 1000;
      
      setElapsed(elapsedSeconds);
      
      // Determine urgency level
      if (remainingSeconds < 0) {
        setUrgency('overdue');
      } else if (remainingSeconds < 300) { // Less than 5 minutes
        setUrgency('critical');
      } else if (remainingSeconds < 600) { // Less than 10 minutes
        setUrgency('warning');
      } else {
        setUrgency('normal');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, targetTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-lg font-bold',
    large: 'text-3xl font-bold',
  };

  const urgencyClasses = {
    normal: 'timer-normal',
    warning: 'timer-warning',
    critical: 'timer-critical',
    overdue: 'timer-overdue',
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]} ${urgencyClasses[urgency]}`}>
      {showIcon && <Clock className="h-5 w-5" />}
      <span>{formatTime(elapsed)}</span>
    </div>
  );
}
