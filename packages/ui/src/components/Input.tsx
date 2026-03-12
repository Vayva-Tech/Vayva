import React from "react";
import { cn } from "../utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-2xl border border-studio-border bg-white px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all shadow-[0_10px_40px_-20px_rgba(16,185,129,0.45)]",
            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-white",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            error && "border-status-danger focus-visible:ring-status-danger",
            className,
          )}
          {...props}
        />
        {helperText && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              error ? "text-status-danger" : "text-text-secondary",
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
