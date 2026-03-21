"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";
import { motion, hoverLift, tapScale } from "../motion";
import { Icon } from "./Icon";

const buttonVariants = cva(
  // WCAG 2.1 AA: Minimum touch target size of 44x44px (mobile accessibility)
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-text-inverse hover:bg-primary-hover shadow-card",
        secondary:
          "bg-background border border-primary text-primary hover:bg-white/40",
        outline: "border border-border text-text-primary hover:bg-white/40",
        ghost: "hover:bg-white/40 text-text-primary",
        link: "text-accent underline-offset-4 hover:underline",
        destructive:
          "bg-status-danger text-text-inverse hover:bg-status-danger/90",
      },
      size: {
        default: "h-11 px-4 py-2", // Increased from h-10 to h-11 for better touch target
        sm: "h-10 rounded-lg px-3 text-xs", // Increased from h-9
        lg: "h-14 rounded-xl px-6 text-base", // Increased from h-12
        icon: "h-11 w-11", // Increased from h-10 w-10 for 44x44px touch target
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  /**
   * Required for icon-only buttons (size="icon")
   * Provides accessible name for screen readers
   */
  "aria-label"?: string;
}

const BaseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild: _asChild = false,
      isLoading = false,
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const MotionButton = motion.button as unknown as React.ElementType;

    // Warn in development if icon button lacks aria-label
    if (process.env.NODE_ENV === "development" && size === "icon" && !ariaLabel) {
      console.warn(
        "Button: Icon-only buttons should have an aria-label for accessibility. " +
        "Add aria-label=\"Description of button action\" to this Button component."
      );
    }

    return (
      <MotionButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        whileHover={!props.disabled && !isLoading ? hoverLift : undefined}
        whileTap={!props.disabled && !isLoading ? tapScale : undefined}
        aria-label={size === "icon" ? ariaLabel : undefined}
        {...props}
      >
        {isLoading && (
          <Icon name="LoaderCircle" className="mr-2 h-4 w-4 animate-spin" role="presentation" />
        )}
        {children}
      </MotionButton>
    );
  },
);
BaseButton.displayName = "Button";

export { BaseButton as Button, buttonVariants };
