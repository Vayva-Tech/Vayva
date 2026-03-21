import * as React from "react";
import { Button } from "@vayva/ui";
import { cn } from "@/lib/utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export type ToastActionElement = React.ReactElement;

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("toast", className)} {...props} />;
  },
);
Toast.displayName = "Toast";

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn("toast-action h-auto py-1 px-2", className)}
      {...props}
    />
  );
});
ToastAction.displayName = "ToastAction";
