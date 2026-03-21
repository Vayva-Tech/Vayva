import * as React from "react";
interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    intensity?: "low" | "medium" | "high";
    variant?: "default" | "elevated" | "interactive" | "bordered";
}
export declare function GlassPanel({ className, intensity, variant, ...props }: GlassPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
