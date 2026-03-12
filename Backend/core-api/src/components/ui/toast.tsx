import * as React from "react";
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
    // eslint-disable-next-line no-restricted-syntax
    <button ref={ref} className={cn("toast-action", className)} {...props} />
  );
});
ToastAction.displayName = "ToastAction";
