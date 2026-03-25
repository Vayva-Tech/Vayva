"use client";

import React from "react";
import { WarningCircle as AlertCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { ArrowsClockwise as RefreshCwIcon } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
import { cn } from "../utils";
import { Button } from "../components/Button";

const AlertCircle = AlertCircleIcon as React.ComponentType<{
  size?: number;
  className?: string;
}>;
const RefreshCw = RefreshCwIcon as React.ComponentType<{
  size?: number;
  className?: string;
}>;

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100",
        className,
      )}
    >
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-lg font-bold text-red-900 mb-2">{title}</h3>
      <p className="text-red-700/80 mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};
