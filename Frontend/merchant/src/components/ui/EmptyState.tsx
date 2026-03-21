"use client";

import { Button , Icon, IconName } from "@vayva/ui";
import Link from "next/link";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-border/40 flex items-center justify-center mb-4">
        <Icon name={icon} className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Link href={action.href}>
            <Button className="bg-vayva-green hover:bg-vayva-green/90 text-white rounded-xl">
              {action.label}
            </Button>
          </Link>
        )}
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className="rounded-xl border-gray-100"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
