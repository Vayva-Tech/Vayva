import * as React from "react";
export interface ToolbarProps {
    left?: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
}
export declare function Toolbar({ left, right, className, }: ToolbarProps): React.JSX.Element;
