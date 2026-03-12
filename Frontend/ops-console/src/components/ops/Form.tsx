"use client";

import React from "react";
import { cn } from "@vayva/ui";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  required,
  children,
  className,
  hint,
}: FormFieldProps): React.JSX.Element {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 border rounded-lg text-sm",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          "transition-colors",
          error
            ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-200 hover:border-gray-300",
          className
        )}
        {...props}
      />
    );
  }
);
FormInput.displayName = "FormInput";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 border rounded-lg text-sm resize-none",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          "transition-colors",
          error
            ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-200 hover:border-gray-300",
          className
        )}
        {...props}
      />
    );
  }
);
FormTextarea.displayName = "FormTextarea";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full px-3 py-2.5 border rounded-lg text-sm bg-white",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          "transition-colors appearance-none",
          error
            ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-200 hover:border-gray-300",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
FormSelect.displayName = "FormSelect";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps): React.JSX.Element {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({
  children,
  className,
}: FormActionsProps): React.JSX.Element {
  return (
    <div className={cn("flex items-center justify-end gap-3 pt-4", className)}>
      {children}
    </div>
  );
}

interface FormErrorSummaryProps {
  errors: string[];
  className?: string;
}

export function FormErrorSummary({
  errors,
  className,
}: FormErrorSummaryProps): React.JSX.Element | null {
  if (errors.length === 0) return null;

  return (
    <div className={cn("bg-red-50 border border-red-200 rounded-lg p-3", className)}>
      <p className="text-sm font-medium text-red-800 mb-2">
        Please fix the following errors:
      </p>
      <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
        {errors.map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

// Validation helper type
export type ValidationRule<T> = {
  field: keyof T;
  message: string;
  validate: (value: unknown) => boolean;
};

// Simple validation hook
export function useFormValidation<T extends Record<string, unknown>>(
  rules: ValidationRule<T>[]
) {
  const validate = (data: T): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const rule of rules) {
      const value = data[rule.field];
      if (!rule.validate(value)) {
        errors[rule.field] = rule.message;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  return { validate };
}
