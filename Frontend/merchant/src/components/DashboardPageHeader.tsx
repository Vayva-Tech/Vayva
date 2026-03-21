"use client";

import React from "react";
import { Button, Icon, IconName } from "@vayva/ui";

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  icon: IconName;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  children?: React.ReactNode;
}

export function DashboardPageHeader({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  children,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-start gap-5">
        <div className="w-14 h-14 bg-vayva-green rounded-2xl flex items-center justify-center shadow-xl shadow-green/20 shrink-0 transform hover:scale-110 transition-transform duration-300">
          <Icon name={icon} className="text-white" size={28} />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tight text-vayva-black leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-gray-400 font-medium max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {children}
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className="font-bold border-gray-100 hover:bg-white/40 transition-all active:scale-95"
          >
            {secondaryAction.icon && (
              <Icon name={secondaryAction.icon} className="w-4 h-4 mr-2" />
            )}
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            className="shadow-xl shadow-black/5 font-bold transition-all hover:shadow-black/10 active:scale-95 bg-black text-white hover:bg-black/90"
          >
            {primaryAction.icon && (
              <Icon name={primaryAction.icon} className="w-4 h-4 mr-2" />
            )}
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
