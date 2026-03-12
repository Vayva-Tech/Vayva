"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";
import { motion, hoverLift, tapScale } from "../motion";
import { Icon } from "./Icon";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
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
      ...props
    },
    ref,
  ) => {
    const MotionButton = motion.button as unknown as React.ElementType;

    return (
      <MotionButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        whileHover={!props.disabled && !isLoading ? hoverLift : undefined}
        whileTap={!props.disabled && !isLoading ? tapScale : undefined}
        {...props}
      >
        {isLoading && (
          <Icon name="LoaderCircle" className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </MotionButton>
    );
  },
);
BaseButton.displayName = "Button";

export { BaseButton as Button, buttonVariants };
