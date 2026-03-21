"use client";

import { Button } from "@vayva/ui";
import { 
  CheckCircle,
  Warning,
  Circle,
  Timer,
  Users
} from "@phosphor-icons/react/ssr";

interface AppointmentStatusProps {
  status: 'in-session' | 'checked-in' | 'available' | 'no-show' | 'filling-up' | 'waiting-list';
  size?: 'sm' | 'md' | 'lg';
}

export function AppointmentStatus({ status, size = 'md' }: AppointmentStatusProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  const statusConfig = {
    'in-session': { 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      label: 'In Session'
    },
    'checked-in': { 
      icon: CheckCircle, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      label: 'Checked In'
    },
    'available': { 
      icon: Circle, 
      color: 'text-gray-400', 
      bgColor: 'bg-gray-100',
      label: 'Available'
    },
    'no-show': { 
      icon: Warning, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      label: 'No Show'
    },
    'filling-up': { 
      icon: Timer, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      label: 'Filling Up'
    },
    'waiting-list': { 
      icon: Users, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100',
      label: 'Waiting List'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`${config.bgColor} rounded-full p-1`}>
        <IconComponent className={`${config.color} ${sizeClasses[size]}`} weight="fill" />
      </div>
      <span className={`font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}