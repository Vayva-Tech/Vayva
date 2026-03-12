import * as React from "react";
import { cn } from "../utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({
  children,
  className,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/50 bg-white/[0.45] backdrop-blur-2xl shadow-[0_10px_30px_-12px_rgba(15,23,42,0.3)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({
  children,
  className,
  ...props
}: CardHeaderProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "p-6 pt-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
