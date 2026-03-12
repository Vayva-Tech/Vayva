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

const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, _ref) => (
  <div
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectItem = React.forwardRef<
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
SelectItem.displayName = "SelectItem";

const SelectValue: React.FC<{
  placeholder?: string;
  children?: React.ReactNode;
}> = ({ placeholder, children }) => (
  <span className="text-sm">{children || placeholder}</span>
);

const SelectContent: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { onValueChange } = React.useContext(SelectContext);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Calculate position relative to viewport
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="absolute inset-0 cursor-pointer"
      />
      {isOpen && (
        <div
          className={cn(
            "fixed z-[9999] border bg-background shadow-lg rounded-md max-h-60 overflow-auto",
            className,
          )}
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
          }}
          onClick={(e) => {
            // Close after selection
            setTimeout(() => setIsOpen(false), 50);
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const SelectPrimitive = {
  Root: Select,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
} as const;

// Exports matching shadcn pattern
export const SelectGroup = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => <div>{children}</div>;
export { SelectValue, SelectTrigger, SelectContent, SelectItem };

export const SelectLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
    {children}
  </div>
);

export const SelectSeparator = ({
  className,
}: {
  className?: string;
}): React.JSX.Element => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
);
