"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Build-safe shim for Select without Radix UI
// Uses native <select> for functionality but keeps Radix-like API structure for compatibility

interface SelectProps {
  children?: React.ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

export const Select: React.FC<SelectProps> = ({
  children,
  value,
  onValueChange,
  defaultValue,
  disabled,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const resolvedValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  // Capture children options for native select
  // This is a rough shim. Ideally we render a native select here.
  return (
    <SelectContext.Provider
      value={{ value: resolvedValue, onValueChange: handleValueChange }}
    >
      <div
        className={cn("relative", disabled && "opacity-50 pointer-events-none")}
      >
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTriggerImpl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
SelectTriggerImpl.displayName = "SelectPrimitive.Trigger";

const SelectItemImpl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ children, className, value, ...props }, ref) => {
  const { onValueChange } = React.useContext(SelectContext);
  return (
    <div
      ref={ref}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItemImpl.displayName = "SelectPrimitive.Item";

export const SelectPrimitive = {
  Root: Select,
  Trigger: SelectTriggerImpl,
  Value: ({
    placeholder,
    children,
  }: {
    placeholder?: string;
    children?: React.ReactNode;
  }) => <span className="text-sm">{children || placeholder}</span>,
  Content: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={cn(
        "absolute top-full left-0 w-full border bg-background/80 backdrop-blur-xl z-50 mt-1 shadow-md rounded-md",
        className,
      )}
    >
      {children}
    </div>
  ),
  Item: SelectItemImpl,
} as const;

SelectPrimitive.Trigger.displayName = "SelectPrimitive.Trigger";
SelectPrimitive.Item.displayName = "SelectPrimitive.Item";

// Exports matching shadcn pattern
export const SelectGroup = ({ children }: { children?: React.ReactNode }) => (
  <div>{children}</div>
);
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = SelectPrimitive.Trigger;
export const SelectContent = SelectPrimitive.Content;

export const SelectLabel = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
    {children}
  </div>
);
export const SelectItem = SelectPrimitive.Item;
export const SelectSeparator = ({ className }: { className?: string }) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
);
