import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "../utils";
export function GlassPanel({ className, intensity = "medium", ...props }) {
    const intensityMap = {
        low: "bg-white/40 backdrop-blur-md border-white/20",
        medium: "bg-white/60 backdrop-blur-xl border-white/30",
        high: "bg-white/80 backdrop-blur-2xl border-white/40",
    };
    return (_jsx("div", { className: cn("rounded-2xl border shadow-sm", intensityMap[intensity], className), ...props }));
}
