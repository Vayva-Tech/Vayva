"use client";

import { Button } from "@vayva/ui";
import { 
  Play,
  Pause,
  Coffee,
  Clock
} from "@phosphor-icons/react/ssr";

interface StaffStatusProps {
  status: 'active' | 'break' | 'off' | 'busy';
  availability?: string;
}

export function StaffStatus({ status, availability }: StaffStatusProps) {
  const statusConfig = {
    active: { 
      label: 'Active', 
      color: 'bg-green-100 text-green-800',
      icon: Play
    },
    break: { 
      label: 'On Break', 
      color: 'bg-yellow-100 text-yellow-800',
      icon: Coffee
    },
    off: { 
      label: 'Off Duty', 
      color: 'bg-gray-100 text-gray-800',
      icon: Pause
    },
    busy: { 
      label: 'Busy', 
      color: 'bg-red-100 text-red-800',
      icon: Clock
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div className="flex flex-col items-end">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
      {availability && (
        <span className="text-xs text-gray-500 mt-1">
          {availability}
        </span>
      )}
    </div>
  );
}