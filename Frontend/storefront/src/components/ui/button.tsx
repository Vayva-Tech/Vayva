import { Button as BaseButton } from "@vayva/ui";
import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost";

type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default:
    "bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:pointer-events-none",
  outline:
    "border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
  icon: "h-10 w-10 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
