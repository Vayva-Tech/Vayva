import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../utils";
export function Progress({ value, max = 100, className, ...props }) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (_jsx("div", { className: cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className), ...props, children: _jsx("div", { className: "h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out", style: { transform: `translateX(-${100 - percentage}%)` } }) }));
}
