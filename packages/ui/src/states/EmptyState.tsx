"use client";

import * as React from "react";
import { Icon, IconName } from "../components/Icon";
import { Button } from "../components/Button";
import { motion, scaleIn } from "../motion";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
}

export function EmptyState({
  title,
  description,
  action,
  actionLabel,
  onAction,
  icon = "info",
}: EmptyStateProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={scaleIn}
      className="w-full"
    >
      <div className="flex flex-col items-center justify-center p-10 sm:p-12 text-center min-h-[360px] border border-dashed border-border rounded-2xl bg-background shadow-card">
        <div className="w-16 h-16 bg-white/40 rounded-2xl flex items-center justify-center mb-6 border border-border shadow-sm">
          <Icon name={icon} className="w-8 h-8 text-text-tertiary" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-text-secondary max-w-sm mb-8 leading-relaxed">
          {description}
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {action
            ? action
            : actionLabel &&
              onAction && (
                <Button
                  onClick={onAction}
                  size="lg"
                  className="px-8 h-12 rounded-xl"
                >
                  {actionLabel}
                </Button>
              )}
        </div>
      </div>
    </motion.div>
  );
}
