"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "");

    // Remove leading 234 or 0 if present
    let cleaned = digits;
    if (cleaned.startsWith("234")) {
      cleaned = cleaned.slice(3);
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }

    // Limit to 10 digits (Nigerian phone numbers)
    cleaned = cleaned.slice(0, 10);

    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(
      (e as React.ChangeEvent<HTMLInputElement>).target.value,
    );
    onChange(formatted);
  };

  const displayValue = value ? `+234 ${value}` : "";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          placeholder="+234 8012345678"
          className={cn(
            "flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white/40",
            error && "border-status-danger focus-visible:ring-status-danger",
            className,
          )}
          {...props}
        />
      </div>
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
      {!helperText && !error && (
        <p className="mt-1.5 text-xs text-text-tertiary">
          Nigerian phone number (10 digits)
        </p>
      )}
    </div>
  );
};
