import * as React from "react";
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
    children: React.ReactNode;
    className?: string;
}
export declare function Badge({ variant, children, className, ...props }: BadgeProps): import("react/jsx-runtime").JSX.Element;
