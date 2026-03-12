"use client";

import React from "react";
import { cn, Button } from "@vayva/ui";
import { motion } from "framer-motion";

// 1. Settings Section Container
export const SettingsSection = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn("flex flex-col gap-6 mb-10 last:mb-0", className)}>
    <div className="flex flex-col gap-1">
      <h3 className="text-lg font-bold text-black">{title}</h3>
      {description && <p className="text-sm text-[#525252]">{description}</p>}
    </div>
    {children}
  </section>
);

// 2. Settings Card (White surface)
export const SettingsCard = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <motion.div
    className={cn(
      "bg-background rounded-xl border border-border/40 shadow-sm overflow-hidden p-6",
      className,
    )}
    whileHover={
      onClick
        ? { y: -2, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }
        : undefined
    }
    onClick={onClick}
  >
    {children}
  </motion.div>
);

// 3. Status Badge
export const StatusBadge = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  let colors = "bg-white/40 text-text-secondary border-border";

  // Status Logic
  const s = status?.toLowerCase() || "draft";
  if (
    ["published", "live", "verified", "connected", "paid", "active"].includes(s)
  ) {
    colors = "bg-green-50 text-green-700 border-green-200";
  } else if (["pending", "in_review", "review", "trialing"].includes(s)) {
    colors = "bg-yellow-50 text-yellow-700 border-yellow-200";
  } else if (["failed", "rejected", "overdue", "disconnected"].includes(s)) {
    colors = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
        colors,
        className,
      )}
    >
      {status?.replace("_", " ")}
    </span>
  );
};

// 4. Action Button Row
export const ActionRow = ({
  label,
  actionLabel,
  onAction,
  description,
  destructive,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => (
  <div className="flex items-center justify-between py-4 border-b border-border/20 last:border-0">
    <div>
      <p className="text-sm font-medium text-black">{label}</p>
      {description && (
        <p className="text-xs text-[#525252] mt-0.5">{description}</p>
      )}
    </div>
    <Button
      variant="link"
      onClick={onAction}
      className={cn(
        "text-sm font-semibold hover:underline h-auto p-0",
        destructive ? "text-red-600" : "text-black",
      )}
    >
      {actionLabel}
    </Button>
  </div>
);
