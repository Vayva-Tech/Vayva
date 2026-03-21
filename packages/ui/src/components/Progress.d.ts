import * as React from "react";
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    className?: string;
}
export declare function Progress({ value, max, className, ...props }: ProgressProps): import("react/jsx-runtime").JSX.Element;
export {};
