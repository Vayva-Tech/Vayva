import * as React from "react";
export interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
    size?: number | string;
    color?: string;
    className?: string;
}
export type IconName = string;
export declare const Icon: ({ name, size, className, ...props }: IconProps) => React.JSX.Element | null;
