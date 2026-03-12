"use client";

import { Button, Icon } from "@vayva/ui";
import { motion } from "framer-motion";

interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function PageError({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  retryLabel = "Try Again",
}: PageErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[350px] text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <Icon name="AlertCircle" size={28} className="text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-text-primary mb-1">{title}</h2>
      <p className="text-sm text-text-secondary max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="rounded-xl px-5">
          <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </motion.div>
  );
}
