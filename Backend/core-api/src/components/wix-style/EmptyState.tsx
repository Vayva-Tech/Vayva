"use client";

import React from "react";
import { Button, Icon, type IconName } from "@vayva/ui";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 rounded-[40px] border border-dashed border-border/60 bg-background/30 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-primary/[0.01] group-hover:bg-primary/[0.02] transition-colors duration-700" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center mb-6 shadow-2xl shadow-primary/10 transition-transform duration-500 group-hover:scale-110"
      >
        <Icon name={icon} size={32} className="text-primary" />
      </motion.div>

      <h3 className="text-2xl font-bold text-text-primary mb-2 tracking-tight text-center">
        {title}
      </h3>
      <p className="text-sm font-medium text-text-secondary text-center max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="rounded-2xl h-12 px-8 gap-2 bg-primary text-text-inverse hover:bg-primary-hover shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          <Icon name="Plus" size={18} />
          <span className="font-bold">{actionLabel}</span>
        </Button>
      )}

      {children && <div className="w-full mt-12">{children}</div>}
    </div>
  );
}
