"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { cn } from "@/lib/utils";
const Progress = React.forwardRef(({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (_jsx("div", { ref: ref, className: cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className), ...props, children: _jsx("div", { className: "h-full w-full flex-1 bg-primary transition-all", style: { transform: `translateX(-${100 - percentage}%)` } }) }));
});
Progress.displayName = "Progress";
export { Progress };
